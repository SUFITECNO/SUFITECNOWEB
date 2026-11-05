// script.js
// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// 1. Hero Section Animation (Runs immediately on load)
const heroTimeline = gsap.timeline();

heroTimeline.fromTo(".hero-title", 
    { y: 50, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
)
.fromTo(".hero-desc", 
    { y: 30, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 
    "-=0.6" // Starts slightly before the previous animation ends
)
.fromTo(".hero-btn", 
    { y: 20, opacity: 0, scale: 0.9 }, 
    { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }, 
    "-=0.4"
);

// 2. Solutions Section Animation (Runs when you scroll down)
gsap.fromTo(".section-title", 
    { y: 50, opacity: 0 },
    {
        y: 0, 
        opacity: 1, 
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#solutions",
            start: "top 80%", // Starts animating when the top of the section hits 80% of the screen height
            toggleActions: "play none none reverse" 
        }
    }
);

// Stagger the cards so they pop in one after the other
gsap.fromTo(".solution-card",
    { y: 60, opacity: 0 },
    {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.2, // 0.2 seconds between each card
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".solution-card",
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    }
);
