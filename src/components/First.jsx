import { Video, Share2, MessageSquare, Code2, Youtube, Monitor, Users, Star, Github, Twitter, Linkedin, Facebook } from 'lucide-react'
import Link from "next/link"
import { useNavigate } from 'react-router-dom';

export default function First() {
   const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Video className="h-8 w-8" />
              <span className="text-xl font-bold">ZoomXf</span>
            </div>
            
            {/* <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm hover:text-blue-400">Home</Link>
              <Link href="/features" className="text-sm hover:text-blue-400">Features</Link>
              <Link href="/docs" className="text-sm hover:text-blue-400">Documentation</Link>
              <Link href="/pricing" className="text-sm hover:text-blue-400">Pricing</Link>
            </div> */}

            <div className="flex items-center gap-4">
              <button className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-white bg-transparent border border-white rounded-md hover:bg-white/10 cursor-pointer"
              onClick={() => window.open("https://github.com/manzil-infinity180/webrtc-client")}>
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
              onClick={() => navigate('/home')}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="moving-gradient"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="relative max-w-4xl mx-auto text-center">
            {/* 3D Elements with Animation */}
            <div className="absolute inset-0 z-0 opacity-30">
              <div className="relative w-full h-full perspective">
                <div className="rotating-planes">
                  <div className="plane plane-1"></div>
                  <div className="plane plane-2"></div>
                  <div className="plane plane-3"></div>
                </div>
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg transform -rotate-12 opacity-20 hover:translate-y-2 transition-transform duration-300"></div>
                <div className="absolute top-8 left-8 w-full h-64 bg-gradient-to-r from-blue-500 to-blue-300 rounded-lg transform -rotate-6 opacity-30 animate-float"></div>
                <div className="absolute top-16 left-16 w-full h-64 bg-gradient-to-r from-blue-400 to-blue-200 rounded-lg transform rotate-3 opacity-40 hover:-translate-y-2 transition-transform duration-300"></div>
              </div>
            </div>
            
            {/* Hero Content */}
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Real-Time Communication Platform
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                Experience seamless WebRTC-powered video chat, messaging, and collaboration tools for modern teams
              </p>
              <div className="flex justify-center">
                <button className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300 cursor-pointer" 
                onClick={() => navigate('/home')}
                >
                  Try Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-24 bg-gradient-to-b from-black to-blue-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              See ZoomXf in Action
            </h2>
            <p className="text-gray-300">
              Watch how teams collaborate in real-time using our platform
            </p>
          </div>
          <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-video">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/Odx7B8faaik" 
                title="Product Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="border-0"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Built with the latest WebRTC technology to provide seamless communication and collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-blue-900/20 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">What People Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-300">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300">{testimonial.content}</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-8 w-8" />
                <span className="text-xl font-bold">ZoomXf</span>
              </div>
              <p className="text-gray-300 mb-4">
                Building the future of real-time communication with WebRTC technology.
              </p>
              <div className="flex gap-4">
                <Link href="https://github.com/manzil-infinity180/webrtc-client" className="text-gray-300 hover:text-white">
                  <Github className="h-6 w-6" />
                </Link>
                <Link href="https://x.com/manzil_rahul" className="text-gray-300 hover:text-white">
                  <Twitter className="h-6 w-6" />
                </Link>               
              </div>
            </div>
            
            {footerLinks.map((column, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href={link.href} className="text-gray-300 hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-white/10 pt-8 mt-8 text-center text-gray-300">
            <p>© 2024 RTConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: <Video className="h-6 w-6 text-blue-400" />,
    title: "Video Chat",
    description: "High-quality peer-to-peer video conferencing with support for multiple participants."
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-blue-400" />,
    title: "Real-time Messaging",
    description: "Instant messaging with rich text support and file sharing capabilities."
  },
  {
    icon: <Code2 className="h-6 w-6 text-blue-400" />,
    title: "Code Editor",
    description: "Collaborative code editing powered by Monaco and Yjs for real-time sync."
  },
  {
    icon: <Youtube className="h-6 w-6 text-blue-400" />,
    title: "YouTube Integration",
    description: "Search and watch YouTube videos together with synchronized playback."
  },
  {
    icon: <Monitor className="h-6 w-6 text-blue-400" />,
    title: "Screen Sharing",
    description: "Share your screen with crystal clear quality and low latency."
  },
  {
    icon: <Users className="h-6 w-6 text-blue-400" />,
    title: "Team Collaboration",
    description: "Built-in tools for effective team collaboration and productivity."
  }
]

const testimonials = [
  {
    name: "Rahul Vishwakarma",
    role: "Xf Creator and Founder",
    content: "ZoomXf has transformed how our remote team collaborates. The real-time code editing and video chat features are game-changers."
  },
  {
    name: "Cameron Peterson ",
    role: "Investor",
    content: "The YouTube integration and screen sharing capabilities make our product demos and team meetings so much more effective."
  },
  {
    name: "Shreya Sharma",
    role: "Tech Lead Xf",
    content: "Outstanding WebRTC implementation. The video quality is excellent and the platform is incredibly reliable."
  }
]

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Documentation", href: "/docs" },
      { label: "API", href: "/api" },
    ]
  },
  {
    title: "ZoomXf",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ]
  }
]