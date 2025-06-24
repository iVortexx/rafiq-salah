
'use client';

import { memo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Languages, ChevronDown, SunIcon, MoonIcon } from 'lucide-react';

const USFlag = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18" className="rounded-sm">
    <path fill="#0A3161" d="M0 0h12v10H0z"/>
    <path fill="#FFF" d="M1.5 1.5h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z m-9 2h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z m-9 2h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z"/>
    <path fill="#B22234" d="M0 2h24v2H0zm0 4h24v2H0zm0 4h24v2H0zm0 4h24v2H0z"/>
    <path fill="#FFF" d="M0 0h24v2H0zm0 4h24v2H0zm12 4h12v2H12zm0 4h12v2H12z"/>
  </svg>
));
USFlag.displayName = 'USFlag';

const EgyptFlag = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 9 6" className="rounded-sm">
    <path fill="#C8102E" d="M0 0h9v2H0z"/>
    <path fill="#FFF" d="M0 2h9v2H0z"/>
    <path d="M0 4h9v2H0z"/>
    <path fill="#CDBA00" d="M4.5 2.5c.2 0 .4.2.4.4v.2h-.8v-.2c0-.2.2-.4.4-.4zm0 .2c.1 0 .2.1.2.2v.1h-.4v-.1c0-.1.1-.2.2-.2zM4.1 3.3h.8v.2h-.8z"/>
  </svg>
));
EgyptFlag.displayName = 'EgyptFlag';

interface LanguageSwitcherProps {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}

const LanguageSwitcher = memo(({ language, setLanguage }: LanguageSwitcherProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Languages className="h-5 w-5" />
                    <span className="uppercase font-bold">{language}</span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('ar')} className="gap-2 cursor-pointer">
                    <EgyptFlag />
                    <span>العربية</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2 cursor-pointer">
                    <USFlag />
                    <span>English</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});
LanguageSwitcher.displayName = 'LanguageSwitcher';

interface ThemeSwitcherProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeSwitcher = memo(({ theme, setTheme }: ThemeSwitcherProps) => {
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <Button onClick={toggleTheme} variant="ghost" size="icon">
            <SunIcon className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
});
ThemeSwitcher.displayName = 'ThemeSwitcher';

interface HeaderProps extends LanguageSwitcherProps, ThemeSwitcherProps {
  title: string;
}

export const Header = memo(({ title, language, setLanguage, theme, setTheme }: HeaderProps) => {
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    return (
        <header className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">{title}</h1>
            <div className='flex items-center gap-2'>
                <LanguageSwitcher language={language} setLanguage={setLanguage} />
                <ThemeSwitcher theme={theme} setTheme={setTheme} />
            </div>
      </header>
    );
});
Header.displayName = 'Header';
