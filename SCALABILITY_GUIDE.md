# Scalability Guide: Handling 500 Concurrent Users

## Current Architecture Analysis

**Current Stack:**
- Frontend: React 18.3.1 + TypeScript
- Backend: Express.js 4.21.2 + Node.js
- Database: PostgreSQL (Neon - Cloud)
- ORM: Prisma v6.11.1
- Caching: None (Currently)
- Load Balancing: Single instance

**Current Bottlenecks for 500 Users:**
1. Single Node.js instance cannot handle 500 concurrent connections efficiently
2. Database connection pooling not optimized
3. No caching layer for frequently accessed data
4. N+1 query problems in Prisma queries
5. No request queuing or rate limiting
6. Missing database indexes for common queries
7. No compression or CDN for static assets
8. Missing API pagination for large datasets

---

## 1. DATABASE OPTIMIZATION (Critical)

### 1.1 Connection Pooling
**Current Issue:** Neon has limited free connections
**Solution:**

```javascript
// server/prisma.ts - Update datasource
// Use PgBouncer or Neon's connection pooling
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
};

// Add connection pooling config in .env
// DATABASE_URL="postgresql://...?schema=public"
// DATABASE_POOL_TIMEOUT=3
// DATABASE_POOL_SIZE=20
```

**Action Items:**
- Upgrade Neon to a paid tier with higher connection limits
- Or use PgBouncer as connection pooler (free, open-source)
- Set connection pool size: `minConnections: 5, maxConnections: 20` in Prisma

### 1.2 Add Missing Database Indexes
**Critical Queries Missing Indexes:**

```sql
-- indexes/create-indexes.sql
-- Add these indexes to Neon database

-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Courses table
CREATE INDEX idx_courses_category_id ON courses(categoryId);
CREATE INDEX idx_courses_instructor_id ON courses(instructorId);
CREATE INDEX idx_courses_featured ON courses(isFeatured);
CREATE INDEX idx_courses_is_active ON courses(isActive);

-- Enrollments table
CREATE INDEX idx_enrollments_user_id ON enrollments(userId);
CREATE INDEX idx_enrollments_course_id ON enrollments(courseId);
CREATE INDEX idx_enrollments_user_course ON enrollments(userId, courseId);

-- Categories table
CREATE INDEX idx_categories_is_active ON categories(isActive);

-- Mock Tests table
CREATE INDEX idx_mock_tests_course_id ON mockTests(courseId);
CREATE INDEX idx_mock_tests_category_id ON mockTests(categoryId);

-- Leads table
CREATE INDEX idx_leads_created_at ON leads(createdAt DESC);
CREATE INDEX idx_leads_email ON leads(email);
```

**Action:** Run these immediately via Neon console

### 1.3 Query Optimization

**Before (N+1 Problem):**
```typescript
// server/storage.ts - BAD: Makes separate query for each course
const courses = await this.db.course.findMany();
for (let course of courses) {
  course.instructor = await this.db.user.findUnique({ where: { id: course.instructorId }});
}
```

**After (Optimized):**
```typescript
// server/storage.ts - GOOD: Single query with relations
const courses = await this.db.course.findMany({
  include: {
    category: true,
    instructor: { select: { id: true, firstName: true, lastName: true } },
    lectures: { take: 5 }, // Only load first 5 lectures
  },
  take: 50, // Paginate results
});
```

**Existing Implementation:**
- ✅ Most queries already use `include` for relations
- ✅ Most queries have pagination with `take`
- ⚠️ Some queries load all lectures unnecessarily

**Fix Required:**
```typescript
// server/storage.ts - Optimize lectures loading
async getCourse(id: number) {
  return await this.db.course.findUnique({
    where: { id },
    include: {
      lectures: {
        take: 100, // Limit lectures loaded
        orderBy: { order: 'asc' }
      },
    }
  });
}
```

---

## 2. CACHING LAYER (Critical for 500 Users)

### 2.1 In-Memory Caching with Redis

**Installation:**
```bash
npm install redis
npm install --save-dev @types/redis
```

**Setup Redis Cache:**
```typescript
// server/cache.ts - NEW FILE
import redis from 'redis';

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

client.on('error', (err) => console.error('Redis error:', err));

export const cache = {
  // Cache for 5 minutes (static data)
  async getOrSet(key: string, fn: () => Promise<any>, ttl = 300) {
    try {
      const cached = await client.get(key);
      if (cached) return JSON.parse(cached);
    } catch (error) {
      console.error('Cache get error:', error);
    }
    
    const data = await fn();
    try {
      await client.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
    return data;
  },

  async invalidate(pattern: string) {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  },
};
```

**Usage in Routes:**
```typescript
// server/routes.ts
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await cache.getOrSet('all_categories', async () => {
      return await storage.getCategories();
    }, 3600); // Cache for 1 hour
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invalidate cache after update
app.put("/api/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const category = await storage.updateCategory(req.params.id, req.body);
    await cache.invalidate('all_categories'); // Bust cache
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

**Cache Strategy:**
- **Courses:** 1 hour TTL
- **Categories:** 1 hour TTL
- **User data:** 30 minutes TTL
- **Homepage settings:** 1 hour TTL
- **Frequently accessed pages:** 5 minutes TTL

### 2.2 Environment Configuration
```
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
CACHE_ENABLED=true
```

**For Production:**
- Use Redis Cloud: https://redis.com/try-free/ (free tier)
- Or AWS ElastiCache ($9-15/month)
- Or Upstash: https://upstash.com/ (free tier available)

---

## 3. API OPTIMIZATION

### 3.1 Request Compression
```typescript
// server/index.ts
import compression from 'compression';

app.use(compression({
  threshold: 1024, // Only compress > 1KB
  level: 6, // Compression level 1-9
}));
```

### 3.2 Rate Limiting
```bash
npm install express-rate-limit
```

```typescript
// server/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Stricter for auth
  skipSuccessfulRequests: true,
});

// server/index.ts
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
```

### 3.3 Implement Pagination
**Current:** Most endpoints already have pagination
**Missing:** Homepage settings endpoint
```typescript
app.get("/api/courses", async (req, res) => {
  const { page = 1, limit = 20, search, featured } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const courses = await storage.getCourses({
    skip,
    take: parseInt(limit),
    search: search as string,
    featured: featured === 'true',
  });
  
  res.json({
    data: courses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: await storage.getCourseCount(),
    }
  });
});
```

---

## 4. LOAD BALANCING & HORIZONTAL SCALING

### 4.1 Enable Node.js Clustering
```typescript
// server/cluster.ts - NEW FILE
import cluster from 'cluster';
import os from 'os';

export function initCluster(startServer: () => void) {
  const numCPUs = os.cpus().length;

  if (cluster.isPrimary) {
    console.log(`Master process ${process.pid} starting ${numCPUs} workers`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    // Restart dead workers
    cluster.on('exit', (worker) => {
      console.log(`Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    console.log(`Worker ${process.pid} started`);
    startServer();
  }
}

// server/index.ts
import { initCluster } from './cluster';

if (process.env.NODE_ENV === 'production') {
  initCluster(() => createServer());
} else {
  createServer();
}
```

### 4.2 Docker + Kubernetes Deployment
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY prisma ./prisma

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/index.js"]
```

**Expected Capacity:**
- Single container: ~50-100 concurrent users
- 5 containers with load balancer: ~400-500 concurrent users
- Use Render.com, Railway.app, or Vercel for easy deployment

---

## 5. FRONTEND OPTIMIZATION

### 5.1 Code Splitting
```typescript
// client/src/App.tsx - Already using lazy loading
const AdminDashboard = lazy(() => import('./pages/admin/dashboard'));
const AdminCourses = lazy(() => import('./pages/admin/courses'));
```

### 5.2 React Query (TanStack) Optimization
```typescript
// client/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### 5.3 CDN for Static Assets
**Production Deployment:**
- Use Cloudflare (free tier)
- Or Vercel Serverless Functions
- Or AWS CloudFront

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'utils': ['zustand', 'axios'],
        }
      }
    }
  }
});
```

---

## 6. MONITORING & OBSERVABILITY

### 6.1 Add Application Monitoring
```bash
npm install pino pino-pretty
npm install @sentry/node
```

```typescript
// server/monitoring.ts
import * as Sentry from '@sentry/node';

export function initMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10% of transactions
    });
  }
}

// server/index.ts
import { initMonitoring } from './monitoring';
initMonitoring();
```

### 6.2 Log Request Performance
```typescript
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  next();
});
```

---

## 7. DATABASE REPLICATION (Advanced)

For 500+ users, implement read replicas:

```javascript
// Use Neon's read replicas feature
// Create a read-only database for reporting/analytics
// Keep master for write operations

// server/prisma.ts
export const prisma = new PrismaClient();
export const prismaRead = process.env.DATABASE_URL_READ 
  ? new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_READ } } })
  : prisma;
```

---

## 8. IMPLEMENTATION ROADMAP

### Phase 1: Immediate (Week 1) - Critical for 500 Users
- [ ] Add database indexes (SQL queries above)
- [ ] Implement Redis caching layer
- [ ] Add rate limiting
- [ ] Enable gzip compression
- [ ] Optimize Prisma queries (select, include, take)

### Phase 2: Short-term (Week 2-3)
- [ ] Set up Node.js clustering
- [ ] Docker containerization
- [ ] Add application monitoring (Sentry)
- [ ] Implement CDN for static assets
- [ ] Add request logging

### Phase 3: Medium-term (Week 4+)
- [ ] Deploy on Kubernetes
- [ ] Setup CI/CD pipeline
- [ ] Database read replicas
- [ ] Advanced caching strategies
- [ ] Load testing (Apache JMeter, k6)

---

## 9. PERFORMANCE TARGETS

**Current Single Instance (1 server):**
- Throughput: 50-100 requests/second
- Latency: 50-100ms
- Can handle: ~100-150 concurrent users

**After Phase 1 (Caching + Indexing):**
- Throughput: 200-300 requests/second
- Latency: 20-50ms
- Can handle: ~300-350 concurrent users

**After Phase 2 (Clustering + Load Balancing):**
- Throughput: 500-800 requests/second
- Latency: 10-30ms
- Can handle: 500+ concurrent users

---

## 10. LOAD TESTING SCRIPT

```bash
# Install k6 for load testing
npm install -g k6

# Create loadtest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '30s',
};

export default function () {
  const res = http.get('https://your-app.com/api/courses');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}

// Run: k6 run loadtest.js
```

---

## 11. CHECKLIST FOR 500 USERS

- [ ] Database connection pooling configured
- [ ] All critical indexes created
- [ ] Redis cache implemented
- [ ] Rate limiting enabled
- [ ] Gzip compression enabled
- [ ] Node.js clustering configured
- [ ] Request timeout set (30s for API)
- [ ] Error handling and logging configured
- [ ] Database backup strategy in place
- [ ] CDN configured for static files
- [ ] Load balancer (Nginx/HAProxy) configured
- [ ] Health check endpoints configured
- [ ] Monitoring dashboard setup
- [ ] Load tested and validated

---

## 12. ESTIMATED COSTS (Monthly)

| Component | Cost | Notes |
|-----------|------|-------|
| Neon DB (Tier) | $25-50 | Includes replicas |
| Redis Cache | $0-15 | Upstash free tier or Redis Cloud |
| VPS Servers (5x) | $50-150 | Render/Railway/Vercel |
| CDN | $0-10 | Cloudflare free tier |
| Monitoring | $0-10 | Sentry, DataDog |
| **Total** | **$75-235** | **Flexible** |

---

## Support for Your Application

For your platform specifically with current features (courses, instructors, categories, leads, enrollments):
- Current scale: ~50-100 users
- After Phase 1: ~300-350 users
- After Phase 2: 500+ users comfortably

**Implement Phase 1 immediately to support 500 users.**

