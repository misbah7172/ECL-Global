import { useQuery } from "@tanstack/react-query";

export default function StatsSection() {
  // Mock stats data - in a real app these would come from the API
  const stats = [
    { label: "Students Enrolled", value: "15,000+", key: "studentsEnrolled" },
    { label: "Courses Offered", value: "50+", key: "coursesOffered" },
    { label: "Branches", value: "12", key: "branches" },
    { label: "Success Rate", value: "98.5%", key: "successRate" },
  ];

  return (
    <section className="bg-white py-12 border-b border-gray-200">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.key}>
              <div className="stats-counter">{stat.value}</div>
              <div className="text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
