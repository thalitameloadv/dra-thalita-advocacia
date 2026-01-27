import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Menu, X, Calculator, BookOpen, Home, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import logo from '@/assets/logo.png';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const whatsappNumber = "5588996017070";
    const whatsappMessage = encodeURIComponent("Olá! Gostaria de agendar uma consulta.");
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const navLinks = [
        { path: '/', label: 'Início', icon: Home },
        { path: '/blog', label: 'Blog', icon: BookOpen },
        {
            label: 'Calculadoras',
            icon: Calculator,
            submenu: [
                { path: '/calculadoras', label: 'Todas as Calculadoras' },
                { path: '/calculadora-aposentadoria', label: 'Aposentadoria' },
                { path: '/calculadora-rescisao-trabalhista', label: 'Rescisão Trabalhista' }
            ]
        }
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-md'
                    : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0">
                        <img
                            src={logo}
                            alt="Thalita Melo Advocacia"
                            className={`transition-all duration-300 ${isScrolled ? 'h-14' : 'h-16'
                                }`}
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link, index) => (
                            link.submenu ? (
                                <DropdownMenu key={index}>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-primary transition-colors">
                                            <link.icon className="h-4 w-4" />
                                            {link.label}
                                            <ChevronDown className="h-3 w-3" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        {link.submenu.map((sublink, subIndex) => (
                                            <DropdownMenuItem key={subIndex} asChild>
                                                <Link
                                                    to={sublink.path}
                                                    className="cursor-pointer"
                                                >
                                                    {sublink.label}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(link.path)
                                            ? 'text-primary'
                                            : 'text-slate-700 hover:text-primary'
                                        }`}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </nav>

                    {/* CTA Button */}
                    <div className="hidden lg:flex items-center gap-4">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            88996017070
                        </a>
                        <Button
                            asChild
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Consulta Gratuita
                            </a>
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-slate-700 hover:text-primary transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-slate-200 bg-white/95 backdrop-blur-md">
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link, index) => (
                                link.submenu ? (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700">
                                            <link.icon className="h-4 w-4" />
                                            {link.label}
                                        </div>
                                        <div className="pl-8 space-y-1">
                                            {link.submenu.map((sublink, subIndex) => (
                                                <Link
                                                    key={subIndex}
                                                    to={sublink.path}
                                                    className="block px-4 py-2 text-sm text-slate-600 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
                                                >
                                                    {sublink.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        key={index}
                                        to={link.path}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive(link.path)
                                                ? 'text-primary bg-primary/10'
                                                : 'text-slate-700 hover:text-primary hover:bg-slate-50'
                                            }`}
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                )
                            ))}

                            <div className="pt-4 px-4 space-y-2">
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors py-2"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    88996017070
                                </a>
                                <Button
                                    asChild
                                    className="w-full bg-primary hover:bg-primary/90 text-white"
                                >
                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Consulta Gratuita
                                    </a>
                                </Button>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
