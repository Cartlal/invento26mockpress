import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code, Github, Linkedin, Instagram } from 'lucide-react';

const developers = [
    {
        name: "JAYDEEP NADKARNI",
        role: "CORE UI/UX DESIGNER ",
        image: "/assets/dev-jaydeep.jpg",
        github: "https://github.com/Jaydeep-Nadkarni",
        instagram: "https://www.instagram.com/jaydeep_nadkarni/",
        linkedin: "https://www.linkedin.com/in/jaydeep-nadkarni"
    },
    {
        name: "KARTHIK HIRENARTI",
        role: "LEAD DEVELOPER AND SYSTEM ARCHITECT",
        image: "/assets/dev-karthik.jpg",
        github: "https://github.com/Cartlal",
        instagram: "https://www.instagram.com/karthikhirenarti/",
        linkedin: "https://www.linkedin.com/in/karthikhirenarti/"
    },
    {
        name: "SARVADNYA PATIL",
        role: "FRONTEND ENGINEER",
        image: "/assets/dev-sarvadnya.jpg",
        github: "https://github.com/Sarvadnya-Patil",
        instagram: "https://www.instagram.com/sarvadnyapatil_004",
        linkedin: "https://www.linkedin.com/in/sarvadnya-patil-946440393/"
    },
    {
        name: "ABHISHEK MUNNOLI",
        role: "BACKEND ENGINEER AND CONTENT WRITER",
        image: "/assets/dev-abhishek.jpg",
        github: "https://github.com/abhishekmanoli",
        instagram: "https://www.instagram.com/abhishek_manoli",
        linkedin: "https://www.linkedin.com/in/abhishekmanoli"
    }
];

function Developers() {
    useEffect(() => {
        document.title = "Developers - INVENTO";
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center p-6 relative overflow-hidden font-sans">
            {/* Darker tiled/pattern background */}
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/assets/invento-bg-mobile.webp')" }}></div>
            <div className="absolute inset-0 bg-[url('/assets/grid.svg')] bg-repeat opacity-5"></div>

            {/* Content Header */}
            <div className="relative z-10 w-full max-w-4xl mt-12 mb-16 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-10 duration-700">
                <h1 className="font-orbitron text-4xl md:text-5xl font-black tracking-wider mb-6">
                    <span className="text-white">MEET THE </span>
                    <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">DEVELOPERS</span>
                </h1>

                <div className="flex flex-col items-center opacity-60">
                    <span className="text-[10px] tracking-[0.3em] font-mono text-gray-400 mb-2 uppercase">Core Engineers</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-gray-400 to-transparent"></div>
                </div>
            </div>

            {/* List of Developers Grid */}
            <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-24 px-4 md:px-8">
                {developers.map((dev, index) => (
                    <div
                        key={index}
                        className="bg-[#0f0f0f]/80 backdrop-blur-md border border-gray-800 hover:border-red-600/50 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_10px_40px_rgba(220,38,38,0.1)] hover:-translate-y-2 group"
                    >
                        {/* Cutout Image Container */}
                        <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-gray-800 group-hover:border-red-500/80 transition-colors duration-500 mb-6 shadow-2xl relative">
                            {/* Inner glow effect on hover */}
                            <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                            <img
                                src={dev.image}
                                alt={dev.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info Section */}
                        <div className="flex flex-col flex-grow justify-center w-full">
                            <h3 className="font-orbitron font-bold text-xl md:text-2xl text-white tracking-widest uppercase mb-2">
                                {dev.name}
                            </h3>

                            <div className="bg-red-600/10 border border-red-600/20 px-4 py-1.5 rounded-full inline-block mb-6 mx-auto">
                                <h4 className="font-mono text-red-500 font-bold text-[9px] md:text-[11px] tracking-[0.2em] uppercase">
                                    {dev.role}
                                </h4>
                            </div>

                            {/* Social Links */}
                            <div className="flex justify-center gap-6 mt-auto pt-4 border-t border-gray-800/50 w-3/4 mx-auto">
                                {dev.github && (
                                    <a href={dev.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-all hover:scale-125 hover:-translate-y-1">
                                        <Github className="w-5 h-5" />
                                    </a>
                                )}
                                {dev.linkedin && (
                                    <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0a66c2] transition-all hover:scale-125 hover:-translate-y-1">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                )}
                                {dev.instagram && (
                                    <a href={dev.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#e1306c] transition-all hover:scale-125 hover:-translate-y-1">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ArcStack Integration */}
            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center mt-12 mb-12 animate-in fade-in duration-700 delay-300">
                <div className="bg-black/60 border border-gray-800 hud-corners p-8 backdrop-blur-md w-full flex flex-col items-center text-center transition-transform hover:shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                    <img src="https://arcstack.netlify.app/arcstack_logo.png" alt="ArcStack Logo" className="w-24 h-auto mb-4 grayscale hover:grayscale-0 transition-all duration-500" />
                    <h2 className="font-orbitron font-bold text-xl tracking-widest text-white mb-2 uppercase">
                        POWERED BY <span className="text-blue-400">ARCSTACK</span>
                    </h2>
                    <p className="font-mono text-xs text-gray-500 mb-6 max-w-md">
                        Explore our coding club's innovations and latest developments. Join the community.
                    </p>
                    <a href="https://arcstack.netlify.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-3 font-bold italic text-sm tracking-[0.2em] bg-blue-500/10 text-blue-400 border border-blue-500 hover:bg-blue-500 hover:text-black transition-all duration-300 transform -skew-x-[10deg]">
                        <Code className="w-4 h-4" />
                        ACCESS PORTAL
                    </a>
                </div>
            </div>

            {/* Back Button */}
            <div className="relative z-10 w-full flex justify-center pb-8 mt-12">
                <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 font-bold italic text-sm tracking-[0.2em] bg-white text-black hover:bg-red-600 hover:text-white transition-all duration-300 transform -skew-x-[15deg]">
                    <ArrowLeft className="w-4 h-4" />
                    RETURN TO SECTOR
                </Link>
            </div>
        </div>
    );
}

export default Developers;
