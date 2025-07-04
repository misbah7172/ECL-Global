import { Link } from "wouter";
import { GraduationCap, Facebook, Youtube, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <GraduationCap className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold">Mentors</span>
            </div>
            <p className="text-gray-300 mb-4">
              Leading the way in test preparation and study abroad counseling for over a decade. Your success is our mission.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/courses" className="text-gray-300 hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="/mock-tests" className="text-gray-300 hover:text-white transition-colors">Mock Tests</Link></li>
              <li><Link href="/events" className="text-gray-300 hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/branches" className="text-gray-300 hover:text-white transition-colors">Branches</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">IELTS Preparation</li>
              <li className="text-gray-300">SAT Preparation</li>
              <li className="text-gray-300">TOEFL Preparation</li>
              <li className="text-gray-300">Study Abroad Counseling</li>
              <li className="text-gray-300">University Applications</li>
              <li className="text-gray-300">Visa Assistance</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3 text-gray-300">
              <p>House 45, Road 27, Block A, Dhanmondi, Dhaka 1209</p>
              <p>+880 1777-123456</p>
              <p>info@mentors.com.bd</p>
              <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Mentors Learning Platform. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
