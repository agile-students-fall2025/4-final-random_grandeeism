import React from "react";
import { NotebookPen, StickyNote, Video, Tag, Rss, BookOpen, Focus, Settings, Smartphone, Headphones, Highlighter, Cloud, Monitor, FolderOpen, Archive, Clock } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { useTheme } from "../hooks/useTheme.js";
import "../assets/fonts/new-spirit.css";

export default function LandingPage({ onNavigate }) {
	const { effectiveTheme } = useTheme();
	const isDark = effectiveTheme === "dark";
	return (
		<div>
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
								Your space for reading, watching, and listening later
							</h1>
							{/* Get started button */}
							<Button
								className="mt-2 mb-0 h-[50px] px-8 rounded-full font-normal text-lg transition-all focus:outline-none bg-black text-white dark:bg-white dark:text-black hover:cursor-pointer"
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
				<nav className="w-full flex justify-center pt-8 md:pt-8 fixed pointer-events-auto z-50 mx-4">
					<div className="w-full max-w-[800px] h-[50px] md:h-[60px] rounded-full flex items-center justify-between pl-3 md:pl-6 bg-white/70 dark:bg-black/70 backdrop-blur-md border border-border mx-8 pr-[10px]" style={{
						boxShadow: isDark 
							? 'rgba(255, 255, 255, 0.01) 0px 50px 40px, rgba(255, 255, 255, 0.02) 0px 50px 40px, rgba(255, 255, 255, 0.05) 0px 20px 40px, rgba(255, 255, 255, 0.08) 0px 3px 10px'
							: 'rgba(0, 0, 0, 0.01) 0px 50px 40px, rgba(0, 0, 0, 0.02) 0px 50px 40px, rgba(0, 0, 0, 0.05) 0px 20px 40px, rgba(0, 0, 0, 0.08) 0px 3px 10px'
					}}>
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
							<button
								onClick={() => {
									const featuresSection = document.getElementById('features');
									if (featuresSection) {
										featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
									}
								}}
								className="px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors invisible lg:visible hover:cursor-pointer"
							>
								Features
							</button>
							<button
								className="px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer"
								onClick={() => onNavigate?.("auth")}
							>
								Log in
							</button>
							<button
								className="h-[36px] md:h-[40px] px-3 md:px-4 rounded-full font-normal text-sm md:text-base transition-colors focus:outline-none bg-black text-white dark:bg-white dark:text-black hover:cursor-pointer hover:opacity-80 active:opacity-70"
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

			{/* New Sections Below Hero */}
			<div className="relative z-0 w-full bg-background">
				{/* Section 1: Features Overview */}
				<section id="features" className="py-16 md:py-24 px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground" style={{ fontFamily: 'New Spirit, serif' }}>
							More than just reading
						</h2>
						<p className="text-2xl md:text-3xl lg:text-4xl mb-12 text-foreground" style={{ fontFamily: 'New Spirit, serif' }}>
							Your complete content companion
						</p>
						
						{/* Features Grid */}
						<div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mt-12">
							<div className="flex flex-col items-center gap-3">
								<StickyNote className="w-10 h-10 md:w-12 md:h-12 text-foreground" />
								<p className="text-sm md:text-base font-medium">Notes</p>
							</div>
							<div className="flex flex-col items-center gap-3">
								<Video className="w-10 h-10 md:w-12 md:h-12 text-foreground" />
								<p className="text-sm md:text-base font-medium">Videos</p>
							</div>
							<div className="flex flex-col items-center gap-3">
								<Tag className="w-10 h-10 md:w-12 md:h-12 text-foreground" />
								<p className="text-sm md:text-base font-medium">Tagging</p>
							</div>
							<div className="flex flex-col items-center gap-3">
								<Rss className="w-10 h-10 md:w-12 md:h-12 text-foreground" />
								<p className="text-sm md:text-base font-medium">Feeds</p>
							</div>
							<div className="flex flex-col items-center gap-3 col-span-2 md:col-span-1">
								<BookOpen className="w-10 h-10 md:w-12 md:h-12 text-foreground" />
								<p className="text-sm md:text-base font-medium">Distraction-Free Reader</p>
							</div>
						</div>
					</div>
				</section>

			{/* Section 2: Distraction Free Reader */}
			<section className="py-16 md:py-20 px-4">
				<div className="max-w-4xl mx-auto rounded-3xl p-8 md:p-12 relative overflow-hidden" style={{ 
					backgroundColor: '#adc2f3',
					boxShadow: 'rgba(0, 0, 0, 0.01) 0px 50px 40px, rgba(0, 0, 0, 0.02) 0px 50px 40px, rgba(0, 0, 0, 0.05) 0px 20px 40px, rgba(0, 0, 0, 0.08) 0px 3px 10px'
				}}>
						<img 
							src="/noise.avif" 
							alt="" 
							className="absolute inset-0 z-0 w-full h-full object-cover rounded-3xl opacity-50 mix-blend-overlay pointer-events-none"
							draggable="false"
							loading="lazy"
						/>
						<div className="relative z-10 text-center mb-8">
							<div className="inline-block mb-4">
								<Focus className="w-12 h-12 md:w-16 md:h-16 text-gray-800" />
							</div>
							<p className="text-sm md:text-base font-semibold uppercase tracking-wide mb-3 text-gray-800">FOCUS</p>
							<h2 className="text-2xl md:text-3xl lg:text-4xl mb-4 text-gray-900" style={{ fontFamily: 'New Spirit, serif' }}>
								Read without distractions
							</h2>
							<p className="text-base md:text-lg text-gray-800">
								Enjoy a clean, clutter-free reading experience. No ads, no popups—just the content you care about.
							</p>
						</div>

						{/* Reader Features */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-8">
							<div className="flex items-center gap-3 bg-white/30 rounded-lg p-4">
								<Settings className="w-6 h-6 md:w-8 md:h-8 text-gray-800 flex-shrink-0" />
								<p className="text-sm md:text-base font-medium text-gray-900">Customizable reader settings</p>
							</div>
							<div className="flex items-center gap-3 bg-white/30 rounded-lg p-4">
								<Smartphone className="w-6 h-6 md:w-8 md:h-8 text-gray-800 flex-shrink-0" />
								<p className="text-sm md:text-base font-medium text-gray-900">Responsive Reader</p>
							</div>
							<div className="flex items-center gap-3 bg-white/30 rounded-lg p-4">
								<BookOpen className="w-6 h-6 md:w-8 md:h-8 text-gray-800 flex-shrink-0" />
								<p className="text-sm md:text-base font-medium text-gray-900">Distraction Free</p>
							</div>
							<div className="flex items-center gap-3 bg-white/30 rounded-lg p-4">
								<Headphones className="w-6 h-6 md:w-8 md:h-8 text-gray-800 flex-shrink-0" />
								<p className="text-sm md:text-base font-medium text-gray-900">Listen to articles</p>
							</div>
						</div>
					</div>
				</section>

			{/* Section 3: Notes */}
			<section className="py-16 md:py-20 px-4">
				<div className="max-w-4xl mx-auto rounded-3xl p-8 md:p-12 relative overflow-hidden" style={{ 
					backgroundColor: '#fbe68c',
					boxShadow: 'rgba(0, 0, 0, 0.01) 0px 50px 40px, rgba(0, 0, 0, 0.02) 0px 50px 40px, rgba(0, 0, 0, 0.05) 0px 20px 40px, rgba(0, 0, 0, 0.08) 0px 3px 10px'
				}}>
						<img 
							src="/noise.avif" 
							alt="" 
							className="absolute inset-0 z-0 w-full h-full object-cover rounded-3xl opacity-50 mix-blend-overlay pointer-events-none"
							draggable="false"
							loading="lazy"
						/>
						<div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
							<div>
							<p className="text-sm md:text-base font-semibold uppercase tracking-wide mb-3 text-gray-800">NOTES</p>
							<h2 className="text-2xl md:text-3xl lg:text-4xl mb-4 text-gray-900" style={{ fontFamily: 'New Spirit, serif' }}>
								Capture your thoughts as you read
							</h2>
							<p className="text-base md:text-lg mb-6 text-gray-800">
								Highlight key passages, add personal notes, and build your knowledge base—all synced across your devices.
							</p>								{/* Notes Features */}
								<div className="space-y-3">
									<div className="flex items-center gap-3 bg-white/30 rounded-lg p-3">
										<StickyNote className="w-6 h-6 text-gray-800 flex-shrink-0" />
										<p className="text-sm md:text-base font-medium text-gray-900">Notes</p>
									</div>
									<div className="flex items-center gap-3 bg-white/30 rounded-lg p-3">
										<Highlighter className="w-6 h-6 text-gray-800 flex-shrink-0" />
										<p className="text-sm md:text-base font-medium text-gray-900">Highlights</p>
									</div>
									<div className="flex items-center gap-3 bg-white/30 rounded-lg p-3">
										<Cloud className="w-6 h-6 text-gray-800 flex-shrink-0" />
										<p className="text-sm md:text-base font-medium text-gray-900">Cloud Saving</p>
									</div>
									<div className="flex items-center gap-3 bg-white/30 rounded-lg p-3">
										<Monitor className="w-6 h-6 text-gray-800 flex-shrink-0" />
										<p className="text-sm md:text-base font-medium text-gray-900">Access from any device</p>
									</div>
								</div>
							</div>

						{/* Notes Viewer Image Placeholder */}
						<div className="hidden md:flex items-center justify-center">
							<img src="/highlights-2.png" alt="Highlights and notes example" className="w-full h-auto rounded-2xl" />
						</div>
						</div>
					</div>
				</section>

				{/* Section 4: Organize */}
				<section className="py-16 md:py-20 px-4">
					<div className="max-w-4xl mx-auto text-center mb-8">
						<p className="text-sm md:text-base font-semibold uppercase tracking-wide mb-3 text-foreground">ORGANIZE</p>
						<h2 className="text-2xl md:text-3xl lg:text-4xl mb-2 text-foreground" style={{ fontFamily: 'New Spirit, serif' }}>
							Your content, your way
						</h2>
						<p className="text-xl md:text-2xl text-foreground" style={{ fontFamily: 'New Spirit, serif' }}>
							Organize with powerful tools that adapt to your workflow
						</p>
					</div>

				<div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
						{/* Container 1: Tagging */}
						<div className="rounded-3xl p-8 md:p-10 relative overflow-hidden" style={{ 
							backgroundColor: '#b7caf4',
							backgroundImage: 'url(/purple_bg_container.avif)',
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							boxShadow: 'rgba(0, 0, 0, 0.01) 0px 50px 40px, rgba(0, 0, 0, 0.02) 0px 50px 40px, rgba(0, 0, 0, 0.05) 0px 20px 40px, rgba(0, 0, 0, 0.08) 0px 3px 10px'
						}}>
							<img 
								src="/noise.avif" 
								alt="" 
								className="absolute inset-0 z-0 w-full h-full object-cover rounded-3xl opacity-50 mix-blend-overlay pointer-events-none"
								draggable="false"
								loading="lazy"
							/>
							<Tag className="relative z-10 w-12 h-12 md:w-14 md:h-14 text-gray-800 mb-4" />
							<h3 className="relative z-10 text-xl md:text-2xl font-semibold mb-3 text-gray-900" style={{ fontFamily: 'New Spirit, serif' }}>
								Tag & Categorize
							</h3>
							<p className="relative z-10 text-base md:text-lg text-gray-800">
								Create custom tags and organize content by topic, priority, or any system that works for you
							</p>
						</div>

						{/* Container 2: Categorize */}
						<div className="rounded-3xl p-8 md:p-10 relative overflow-hidden" style={{ 
							backgroundColor: '#a2d3ee',
							backgroundImage: 'url(/blue_bg_container.webp)',
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							boxShadow: 'rgba(0, 0, 0, 0.01) 0px 50px 40px, rgba(0, 0, 0, 0.02) 0px 50px 40px, rgba(0, 0, 0, 0.05) 0px 20px 40px, rgba(0, 0, 0, 0.08) 0px 3px 10px'
						}}>
							<img 
								src="/noise.avif" 
								alt="" 
								className="absolute inset-0 z-0 w-full h-full object-cover rounded-3xl opacity-50 mix-blend-overlay pointer-events-none"
								draggable="false"
								loading="lazy"
							/>
							<FolderOpen className="relative z-10 w-12 h-12 md:w-14 md:h-14 text-gray-800 mb-4" />
							<h3 className="relative z-10 text-xl md:text-2xl font-semibold mb-3 text-gray-900" style={{ fontFamily: 'New Spirit, serif' }}>
								Smart Collections
							</h3>
							<p className="relative z-10 text-base md:text-lg text-gray-800">
								Sort articles into Read Now, Read Later, or Archive—keeping your reading list manageable
							</p>
							<div className="relative z-10 flex gap-3 mt-4">
								<Clock className="w-6 h-6 text-gray-700" />
								<Archive className="w-6 h-6 text-gray-700" />
							</div>
						</div>
					</div>
				</section>

			{/* Section 5: CTA */}
			<section className="py-16 md:py-20 px-4 mb-16">
				<div className="max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center relative overflow-hidden" style={{ 
					backgroundColor: '#9cd8a9',
					boxShadow: 'rgba(0, 0, 0, 0.01) 0px 50px 40px, rgba(0, 0, 0, 0.02) 0px 50px 40px, rgba(0, 0, 0, 0.05) 0px 20px 40px, rgba(0, 0, 0, 0.08) 0px 3px 10px'
				}}>
						<img 
							src="/noise.avif" 
							alt="" 
							className="absolute inset-0 z-0 w-full h-full object-cover rounded-3xl opacity-50 mix-blend-overlay pointer-events-none"
							draggable="false"
							loading="lazy"
						/>
						<h2 className="relative z-10 text-3xl md:text-4xl lg:text-5xl mb-4 text-gray-900" style={{ fontFamily: 'New Spirit, serif' }}>
							Ready to transform your reading?
						</h2>
						<p className="relative z-10 text-lg md:text-xl mb-8 text-gray-800">
							Get started today—completely free, no credit card required
						</p>
						<Button
							className="relative z-10 h-[50px] px-10 rounded-full font-normal text-lg transition-all focus:outline-none bg-black text-white hover:bg-gray-800"
							style={{ 
								boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)'
							}}
							onClick={() => onNavigate?.("auth")}
						>
							Sign Up
						</Button>
					</div>
				</section>

			{/* Footer */}
			<footer className="px-4 pb-4">
				<div className="max-w-full rounded-[30px] bg-black relative overflow-hidden py-8 md:py-10" style={{
					boxShadow: 'rgba(255, 255, 255, 0.01) 0px 50px 40px, rgba(255, 255, 255, 0.02) 0px 50px 40px, rgba(255, 255, 255, 0.05) 0px 20px 40px, rgba(255, 255, 255, 0.08) 0px 3px 10px'
				}}>
						<img 
							src="/noise.avif" 
							alt="" 
							className="absolute inset-0 z-0 w-full h-full object-cover opacity-30 mix-blend-overlay pointer-events-none"
							draggable="false"
							loading="lazy"
						/>
						<div className="relative z-10 flex flex-col items-center justify-center gap-4">
							<div className="flex items-center gap-3">
								<img
									src="/favicon.svg"
									alt="Fieldnotes logo"
									className="h-8 w-8 md:h-10 md:w-10 invert"
								/>
								<span className="text-xl md:text-2xl tracking-tight text-white select-none" style={{ fontFamily: 'New Spirit, serif' }}>
									fieldnotes
								</span>
							</div>
							<p className="text-sm md:text-base text-gray-400">
								© {new Date().getFullYear()} Fieldnotes. All rights reserved.
							</p>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}