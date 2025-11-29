import React from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { useTheme } from "../hooks/useTheme.js";
import "../assets/fonts/new-spirit.css";

export default function LandingPage({ onNavigate }) {
	const { effectiveTheme } = useTheme();
	const isDark = effectiveTheme === "dark";
	return (
		<div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center relative">
			{/* Background image with border */}
			<div
				className="absolute inset-0 flex items-center justify-center z-0 m-4"
				aria-hidden="true"
			>
				<div className="w-full h-full flex items-center justify-center">
					<div className="w-full h-full overflow-hidden relative rounded-[30px]">
						<img
							src="/landing_bg.png"
							alt="Landing background"
							className="object-cover w-full h-full"
						/>
						{/* Hero content - placed within background container */}
						<div className="absolute inset-0 flex flex-col items-center z-10 pt-[100px] overflow-hidden">
							{/* Hero title */}
							<h1 
								className="text-center text-3xl md:text-4xl lg:text-5xl mb-6 max-w-2xl px-4 text-black" 
								style={{ 
									fontFamily: 'New Spirit, serif',
									animation: 'fadeInUp 0.6s ease-out 0.2s both'
								}}
							>
								Your space for reading, watching and listening later
							</h1>
							{/* Get started button */}
							<Button
								className="mt-2 mb-0 h-[50px] px-8 rounded-full font-medium text-lg transition-all focus:outline-none bg-black text-white dark:bg-white dark:text-black hover:cursor-pointer"
								style={{ 
									animation: 'fadeInUp 0.6s ease-out 0.2s both',
									boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)'
								}}
								onClick={() => onNavigate?.("auth")}
							>
								Get started
							</Button>
							{/* Hero application image - positioned below button */}
							<div 
								className="w-[70vw] md:w-[90vw] max-w-4xl flex justify-center items-start overflow-hidden mt-[50px] md:border-t md:border-l md:border-r md:border-border md:border-[#d5d5d9] lg:rounded-t-[24px] md:rounded-t-md rounded-b-none hero-app-image-shadow"
								style={{ 
									animation: 'fadeInUp 0.6s ease-out 0.2s both'
								}}
							>
								{/* Mobile image */}
								<img
									src={isDark ? "/application_hero_mobile_dark.png" : "/application_hero_mobile.png"}
									alt="Fieldnotes application preview"
									className="w-full object-contain md:hidden"
								/>
								{/* Desktop image */}
								<img
									src={isDark ? "/application_hero_dark.png" : "/application_hero.png"}
									alt="Fieldnotes application preview"
									className="w-[90vw] max-w-4xl object-contain hidden md:block"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Content overlay */}
			<div className="relative z-10 w-full flex flex-col items-center min-h-screen overflow-hidden pointer-events-none">
				{/* Navbar */}
				<nav className="w-full flex justify-center pt-8 md:pt-8 fixed pointer-events-auto z-20 mx-4">
					<div className="w-full max-w-[800px] h-[50px] md:h-[60px] rounded-full flex items-center justify-between pl-3 md:pl-6 bg-white/70 dark:bg-black/70 backdrop-blur-md border border-border mx-8 pr-[10px]">
						{/* Logo and text */}
						<div className="flex items-center gap-2 md:gap-3">
							<img
								src="/favicon.svg"
								alt="Fieldnotes logo"
								className="h-6 w-6 md:h-8 md:w-8 dark:invert"
							/>
							<span className="text-lg md:text-xl lg:text-2xl tracking-tight text-foreground select-none" style={{ fontFamily: 'New Spirit, serif' }}>
								fieldnotes
							</span>
						</div>
						{/* Nav links */}
						<div className="flex items-center gap-1 md:gap-2 lg:gap-4">
							<a
								href="#features"
								className="px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors invisible lg:visible"
							>
								Features
							</a>
							<button
								className="px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer"
								onClick={() => onNavigate?.("auth")}
							>
								Log in
							</button>
							<button
								className="h-[36px] md:h-[40px] px-3 md:px-4 rounded-full font-medium text-sm md:text-base transition-colors focus:outline-none bg-black text-white dark:bg-white dark:text-black hover:cursor-pointer hover:opacity-80 active:opacity-70"
								style={{ minWidth: 'auto' }}
								onClick={() => onNavigate?.("auth")}
							>
								<span className="hidden sm:inline">Get started</span>
								<span className="sm:hidden">Start</span>
							</button>
						</div>
					</div>
				</nav>

			{/* Hero section */}
			<div className="flex flex-col items-center justify-center flex-1 w-full pb-0 px-4 overflow-hidden" style={{height: 'calc(100vh - 120px)'}}>
				{/* <h1 className="text-center text-3xl md:text-4xl lg:text-5xl mb-6 max-w-xl pt-[100px] text-black" style={{ fontFamily: 'New Spirit, serif' }}>
					Your space for reading, watching and listening later
				</h1> */}
				
				{/* Spacer for application_hero image (now in background container) */}
				<div className="w-full flex justify-center items-end flex-1" style={{ position: 'relative', height: '100%' }}>
					<div
						className="relative w-full max-w-5xl flex justify-center items-end"
						style={{ minHeight: 220, height: '100%' }}
					>
						{/* This space is reserved for the application_hero image which is now in the background container */}
					</div>
				</div>
			</div>
			</div>
		</div>
	);
}