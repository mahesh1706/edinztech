import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPrograms } from '../lib/api';
import ProgramCard from '../components/ProgramCard';
import Button from '../components/ui/Button';
import { Icons } from '../components/icons';

export default function Home() {
    const [featuredPrograms, setFeaturedPrograms] = useState([]);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch all programs (or add a specific 'featured' endpoint/param later)
                // For now, take first 3 active programs
                const data = await getPrograms();
                setFeaturedPrograms(data.slice(0, 3));
            } catch (err) {
                console.error("Failed to load featured programs", err);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center py-16 space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-primary font-medium text-sm mb-4">
                    <Icons.Rocket size={16} />
                    <span>Launch your tech career today</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-secondary leading-tight tracking-tight">
                    Unlock Your Potential with <br /> <span className="text-primary relative">EdinzTech</span>
                </h1>
                <p className="text-xl text-text-light max-w-2xl mx-auto leading-relaxed">
                    Industry-leading courses, internships, and workshops designed to bridge the gap between learning and success.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Link to="/courses">
                        <Button size="lg" className="rounded-full px-8 py-4 text-lg w-full sm:w-auto shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">Explore Courses</Button>
                    </Link>
                    <Link to="/internships">
                        <Button variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg w-full sm:w-auto">Find Internships</Button>
                    </Link>
                </div>
            </section>

            {/* Featured Programs */}
            <section>
                <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-secondary">Featured Programs</h2>
                        <p className="text-text-light mt-2">Handpicked for your career growth</p>
                    </div>
                    <Link to="/courses" className="text-primary font-medium hover:underline flex items-center gap-1 group">
                        View All <Icons.ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredPrograms.map(program => (
                        <ProgramCard key={program._id || program.id} program={program} />
                    ))}
                </div>
            </section>

            {/* Categories / Services */}
            <section className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-secondary mb-4">Our Services</h2>
                        <p className="text-text-light max-w-xl mx-auto">Choose the learning path that suits your career goals.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Courses", icon: Icons.Courses, desc: "Comprehensive learning paths with expert mentorship", link: "/courses", color: "text-blue-600", bg: "bg-blue-50" },
                            { title: "Internships", icon: Icons.Internships, desc: "Real-world experience on live industry projects", link: "/internships", color: "text-purple-600", bg: "bg-purple-50" },
                            { title: "Workshops", icon: Icons.Workshops, desc: "Short intensive sessions on specific technologies", link: "/workshops", color: "text-orange-600", bg: "bg-orange-50" },
                        ].map((service, idx) => (
                            <Link key={idx} to={service.link} className="block group h-full">
                                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all text-center border border-gray-100 h-full flex flex-col items-center hover:-translate-y-1">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${service.bg} ${service.color}`}>
                                        <service.icon size={36} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-secondary mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                                    <p className="text-text-light leading-relaxed">{service.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}