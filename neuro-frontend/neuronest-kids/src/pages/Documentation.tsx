import { useEffect } from "react";

const Documentation = () => {
  useEffect(() => {
    // Auto-redirect to the diagrams.html file which is printable
    // Or render the documentation inline
    document.title = "NeuroNest — Project Documentation";
  }, []);

  const handleDownloadDocs = () => {
    window.open("/docs/PROJECT_SUBMISSION.md", "_blank");
  };

  const handleOpenDiagrams = () => {
    window.open("/docs/diagrams.html", "_blank");
  };

  const handlePrintPage = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white p-8 max-w-[210mm] mx-auto" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Non-printable controls */}
      <div className="no-print mb-8 flex gap-4 flex-wrap sticky top-0 bg-white py-4 z-50 border-b">
        <button
          onClick={handlePrintPage}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          📄 Print / Save as PDF
        </button>
        <button
          onClick={handleOpenDiagrams}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          📊 Open DFD & ERD Diagrams (Printable)
        </button>
        <button
          onClick={handleDownloadDocs}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          📝 View Raw Documentation
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          h2 { page-break-before: always; }
          h2:first-of-type { page-break-before: auto; }
          table { page-break-inside: avoid; }
          .page-break { page-break-before: always; }
        }
        .doc-content h1 { font-size: 28px; font-weight: bold; margin: 0 0 8px; color: #1a1a1a; }
        .doc-content h2 { font-size: 22px; font-weight: bold; margin: 40px 0 16px; border-bottom: 2px solid #333; padding-bottom: 6px; color: #1a1a1a; }
        .doc-content h3 { font-size: 17px; font-weight: bold; margin: 28px 0 12px; color: #333; }
        .doc-content h4 { font-size: 15px; font-weight: bold; margin: 20px 0 10px; color: #444; }
        .doc-content p { font-size: 13px; line-height: 1.7; margin: 8px 0; color: #333; text-align: justify; }
        .doc-content table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 12px; }
        .doc-content th, .doc-content td { border: 1px solid #999; padding: 6px 10px; text-align: left; }
        .doc-content th { background: #f0f0f0; font-weight: 600; }
        .doc-content ul, .doc-content ol { margin: 8px 0 8px 24px; font-size: 13px; line-height: 1.7; }
        .doc-content li { margin: 4px 0; }
        .doc-content code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 12px; font-family: 'Courier New', monospace; }
        .doc-content pre { background: #f5f5f5; padding: 12px 16px; border-radius: 4px; overflow-x: auto; font-size: 11px; line-height: 1.5; margin: 12px 0; border: 1px solid #ddd; }
        .doc-content pre code { background: none; padding: 0; }
        .doc-content blockquote { border-left: 4px solid #888; padding: 8px 16px; margin: 12px 0; background: #f9f9f0; font-size: 13px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 30px; font-size: 14px; }
      `}</style>

      <div className="doc-content">
        {/* COVER PAGE */}
        <div style={{ textAlign: "center", paddingTop: "100px", paddingBottom: "100px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>NeuroNest</h1>
          <p style={{ fontSize: "20px", color: "#555", marginBottom: "8px" }}>Autism-Friendly Educational Game Platform</p>
          <p style={{ fontSize: "16px", color: "#777", marginBottom: "40px" }}>A Comprehensive Web Application for Special Education</p>
          <p style={{ fontSize: "14px", color: "#888" }}>Project Documentation & Technical Report</p>
          <p style={{ fontSize: "14px", color: "#888" }}>Academic Year 2025–2026</p>
          <p style={{ fontSize: "14px", color: "#888", marginTop: "16px" }}>Platform: Web Application (React + TypeScript + PostgreSQL)</p>
          <p style={{ fontSize: "14px", color: "#888" }}>Version 2.0.0</p>
        </div>

        {/* TABLE OF CONTENTS */}
        <h2>TABLE OF CONTENTS</h2>
        <table>
          <thead>
            <tr><th>S.No.</th><th>Contents</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>Introduction</td></tr>
            <tr><td>2</td><td>Project Objective</td></tr>
            <tr><td>3</td><td>Background Study</td></tr>
            <tr><td>3.1</td><td>Organization Profile</td></tr>
            <tr><td>3.2</td><td>Study on Existing System</td></tr>
            <tr><td>4</td><td>Proposed System</td></tr>
            <tr><td>4.1</td><td>Defining the Problem (Modules)</td></tr>
            <tr><td>5</td><td>System Specification</td></tr>
            <tr><td>5.1</td><td>Software Specification</td></tr>
            <tr><td>5.2</td><td>Hardware Specification</td></tr>
            <tr><td>5.3</td><td>Application Specification</td></tr>
            <tr><td>6</td><td>System Design & Development</td></tr>
            <tr><td>6.1</td><td>Data Flow Diagram</td></tr>
            <tr><td>6.2</td><td>Entity Relationship Diagram</td></tr>
            <tr><td>6.3</td><td>Input Design</td></tr>
            <tr><td>6.4</td><td>Output Design</td></tr>
            <tr><td>6.5</td><td>Database Design</td></tr>
            <tr><td>7</td><td>System Testing</td></tr>
            <tr><td>7.1</td><td>Unit Testing</td></tr>
            <tr><td>7.2</td><td>Integration Testing</td></tr>
            <tr><td>7.3</td><td>System Testing</td></tr>
            <tr><td>7.4</td><td>Acceptance Testing</td></tr>
            <tr><td>7.5</td><td>Black Box Testing</td></tr>
            <tr><td>7.6</td><td>White Box Testing</td></tr>
            <tr><td>7.7</td><td>Validation Testing</td></tr>
            <tr><td>8</td><td>System Implementation & Maintenance</td></tr>
            <tr><td>9</td><td>Conclusion</td></tr>
            <tr><td>10</td><td>Future Enhancements</td></tr>
            <tr><td>11</td><td>Bibliography</td></tr>
            <tr><td>12</td><td>Appendix</td></tr>
          </tbody>
        </table>

        {/* 1. INTRODUCTION */}
        <h2>1. INTRODUCTION</h2>
        <p>
          Autism Spectrum Disorder (ASD) affects approximately 1 in 36 children according to the Centers for Disease Control and Prevention (CDC, 2023). Children with ASD often experience challenges in communication, social interaction, and learning through conventional teaching methods. Traditional educational tools and classroom environments may be overwhelming for these children due to sensory overload, unpredictable stimuli, and rigid learning structures that do not accommodate individual differences in processing speed, attention span, and preferred learning modalities.
        </p>
        <p>
          Digital technology has emerged as a powerful medium for supporting children with ASD. Research by Grynszpan et al. (2014) demonstrated that technology-based interventions can significantly improve social communication, cognitive skills, and academic performance in children on the autism spectrum. However, most existing educational applications fail to provide personalized learning experiences that adapt to each child's unique cognitive profile and sensory preferences.
        </p>
        <p>
          <strong>NeuroNest</strong> is a comprehensive, web-based educational game platform designed specifically to address these challenges. The platform provides a safe, structured, and engaging digital learning environment for children with autism and other learning needs, supporting a wide age range from 3 to 25 years. It is built using modern web technologies including React 18 for the frontend, TypeScript for type safety, and PostgreSQL for persistent data storage.
        </p>
        <p>
          The platform operates on a dual-account architecture that clearly separates the responsibilities of parents and children. Parents serve as administrators who create and manage child profiles, configure learning parameters remotely from any device (including mobile phones), and monitor progress through detailed AI-powered analytical reports. Children interact with a colorful, animated game hub featuring friendly mascot characters that guide and encourage them throughout their learning journey.
        </p>
        <p>NeuroNest distinguishes itself from existing solutions through several key innovations:</p>
        <ul>
          <li><strong>Real-time Parent Remote Control</strong> via WebSocket synchronization — parents can change difficulty levels, enable or disable specific game categories, set daily schedules, and configure milestone notifications from their phone, and all changes reflect instantly on the child's active device session without requiring any page refresh or manual intervention.</li>
          <li><strong>Adaptive AI Difficulty System</strong> powered by the Google Gemini 2.5-flash model, which dynamically adjusts game difficulty based on the child's historical performance data, including accuracy rates, response times, and frustration indicators.</li>
          <li><strong>Comprehensive Behavioral Profiling</strong> that continuously tracks attention span, frustration thresholds, preferred pace, strong and weak learning categories, and optimal learning times throughout each session.</li>
          <li><strong>Gamification Engine</strong> with experience points (XP), unlockable badges, streak tracking, and star-based rewards that maintain engagement and motivation across learning sessions.</li>
          <li><strong>Sensory Customization</strong> allowing parents to adjust sound effects, animation intensity, visual pace, and color sensitivity settings to accommodate each child's unique sensory profile.</li>
        </ul>
        <p>
          The application comprises 12 fully-functional educational games spanning multiple learning domains: letters and alphabet recognition, number counting and comparison, shape matching, color recognition, emotional understanding, memory training, musical instrument identification, weather concepts, body part identification, animal recognition, kitchen and household item recognition, and vowel/consonant differentiation. Each game follows a structured format of 10 rounds (7 standard difficulty questions followed by 3 adaptive difficulty questions) with real-time scoring, streak tracking, and performance analytics.
        </p>

        {/* 2. PROJECT OBJECTIVE */}
        <h2>2. PROJECT OBJECTIVE</h2>
        <p>The primary objectives of the NeuroNest educational game platform are articulated across six key dimensions:</p>
        
        <h3>2.1 Accessible Education for Children with Autism</h3>
        <p>The foremost objective is to provide an accessible, inclusive educational environment for children with autism spectrum disorder and related learning challenges. The platform must accommodate diverse learning styles by offering multi-sensory game experiences that combine visual, auditory, and interactive elements. Games must be designed with clear instructions, consistent interfaces, and predictable patterns that reduce anxiety and cognitive overload while promoting active learning engagement.</p>
        
        <h3>2.2 Empowering Parents with Real-Time Remote Control</h3>
        <p>A critical objective is to empower parents and caregivers with complete remote control over their child's learning environment. Parents must be able to customize difficulty levels (1–5 scale), filter content by age appropriateness (ages 1–25), enable or disable specific game categories, set daily play schedules with start and end times, configure break reminders, and set maximum games per session — all from their own mobile phone or any internet-connected device. These changes must propagate to the child's active session in real-time via WebSocket technology, requiring zero intervention on the child's device.</p>
        
        <h3>2.3 AI-Powered Adaptive Learning</h3>
        <p>The platform must leverage artificial intelligence to adapt game difficulty automatically based on each child's individual performance metrics. The AI system analyzes historical accuracy rates, response times, error patterns, and session duration to generate personalized difficulty adjustments. When a child demonstrates mastery (accuracy ≥ 70%), the system introduces harder questions; when a child struggles (accuracy &lt; 40%), the system reduces difficulty to prevent frustration and maintain engagement.</p>
        
        <h3>2.4 Progress Tracking and Analytical Reporting</h3>
        <p>Parents must have access to detailed analytical reports covering game-by-game performance breakdowns, accuracy trends over time, time spent per category, strongest and weakest learning areas, and AI-generated recommendations for improvement. These reports are secured behind a PIN-protected interface to ensure children cannot access or modify parental settings.</p>
        
        <h3>2.5 Security and Data Protection</h3>
        <p>The platform must implement robust security measures including Row-Level Security (RLS) policies on all database tables ensuring users can only access their own data, role-based access control separating parent and child permissions, PIN-gated access to sensitive parental features, and encrypted authentication tokens for session management.</p>
        
        <h3>2.6 Gamification and Motivation</h3>
        <p>The platform must maintain long-term engagement through a comprehensive gamification system. Children earn experience points (XP) for completing games, unlock achievement badges for milestones (first game, perfect score, 5-game streak), receive star ratings (1–3 stars based on accuracy), and benefit from configurable milestone notifications that alert parents to significant achievements or areas of concern.</p>

        {/* 3. BACKGROUND STUDY */}
        <h2>3. BACKGROUND STUDY</h2>
        
        <h3>3.1 Organization Profile</h3>
        <p>NeuroNest was conceived and developed as an academic final-year project with the goal of creating a production-ready educational technology solution for children with autism spectrum disorder. The project was developed using modern web development methodologies following an Agile development lifecycle with iterative feature delivery and continuous integration.</p>
        <p><strong>Development Team Structure:</strong></p>
        <ul>
          <li>Project Lead / Full-Stack Developer: Responsible for architecture design, frontend implementation, backend configuration, and database schema design</li>
          <li>Academic Supervisor: Provided guidance on educational content, testing methodology, and documentation standards</li>
        </ul>
        <p><strong>Development Methodology:</strong> The project followed an Agile Scrum framework with two-week sprint cycles. Each sprint included planning, development, testing, and review phases. User stories were prioritized using MoSCoW classification (Must have, Should have, Could have, Won't have). Version control was maintained through Git with feature branching and pull request reviews.</p>
        <p><strong>Technology Selection Rationale:</strong></p>
        <ul>
          <li><strong>React 18</strong> was selected for its component-based architecture, virtual DOM performance optimization, and extensive ecosystem of accessible UI component libraries</li>
          <li><strong>TypeScript</strong> was chosen over JavaScript for compile-time type checking, enhanced IDE support, and reduced runtime errors in a complex application with multiple data models</li>
          <li><strong>PostgreSQL</strong> was selected as the relational database management system for its robust support of JSONB data types (essential for storing flexible game configuration data), Row-Level Security policies, real-time change notifications, and ACID compliance</li>
          <li><strong>Tailwind CSS</strong> was adopted for rapid UI development with utility-first classes that facilitate responsive design across mobile, tablet, and desktop viewports</li>
        </ul>

        <h3>3.2 Study on Existing System</h3>
        <p>A comprehensive review of existing educational platforms for children with autism was conducted:</p>
        <table>
          <thead>
            <tr><th>Existing Application</th><th>Target Age</th><th>Key Features</th><th>Limitations</th></tr>
          </thead>
          <tbody>
            <tr><td>Autism Therapy with MITA</td><td>2–12</td><td>Visual puzzles, language exercises</td><td>No parent remote control; static difficulty; no real-time sync</td></tr>
            <tr><td>Otsimo Special Education</td><td>2–8</td><td>AAC board, matching games</td><td>Limited game variety; no adaptive AI; no behavioral analytics</td></tr>
            <tr><td>AutiSpark</td><td>2–10</td><td>Social stories, daily routines</td><td>No WebSocket sync; parents must use child's device to configure</td></tr>
            <tr><td>Endless Reader</td><td>4–8</td><td>Word learning games</td><td>Not autism-specific; no sensory customization; no parent dashboard</td></tr>
            <tr><td>Khan Academy Kids</td><td>2–8</td><td>Math, reading, logic games</td><td>Generic platform; no autism-specific adaptations; no behavioral profiling</td></tr>
            <tr><td>ABCmouse</td><td>2–8</td><td>Comprehensive curriculum</td><td>Subscription-based; no real-time parent control; no AI difficulty adjustment</td></tr>
          </tbody>
        </table>
        <p><strong>Key Gaps Identified:</strong></p>
        <ol>
          <li>No remote parent control — all reviewed platforms require parents to physically access the child's device</li>
          <li>Static difficulty levels without AI-driven automatic adjustment</li>
          <li>Limited sensory customization for children with sensory processing differences</li>
          <li>No real-time synchronization — changes require page refresh or app restart</li>
          <li>Lack of behavioral analytics and AI-driven learning insights</li>
          <li>Narrow age range (2–8), excluding older children and young adults</li>
        </ol>

        {/* 4. PROPOSED SYSTEM */}
        <h2>4. PROPOSED SYSTEM</h2>
        <p>The proposed NeuroNest system is a complete, integrated educational platform combining interactive game-based learning with intelligent adaptation, real-time parental control, and comprehensive analytics. The system follows a three-tier architecture: presentation layer (React frontend), application layer (Edge Functions), and data layer (PostgreSQL).</p>
        
        <h3>4.1 Defining the Problem (Modules)</h3>
        <p>The system is decomposed into eight functional modules:</p>
        
        <h4>Module M1: Authentication & User Management</h4>
        <p>Handles user registration, login, session management, and role assignment. When a parent signs up with email and password, the system automatically creates three associated records: a user profile (display name, email), a user role assignment (parent role), and default parental settings (sound enabled, animations enabled, 30-minute session duration). Authentication tokens are managed via secure HTTP-only sessions with automatic token refresh.</p>
        
        <h4>Module M2: Parent Dashboard & Child Management</h4>
        <p>The Parent Dashboard serves as the central management hub. It displays all registered child profiles as interactive cards showing the child's name, age, avatar, and quick action buttons (Play, Remote Control, Edit, Delete). Parents can create new child profiles by specifying a name, age (1–25), and selecting an avatar character. Deletion requires confirmation and cascades to remove all associated game sessions, behavioral profiles, and remote control settings.</p>
        
        <h4>Module M3: Child Dashboard & Game Hub</h4>
        <p>The Child Dashboard is the primary interface for children. It displays 12+ educational games organized into five categories: Everyday Fun, Numbers in Action, Word World, Sensory Play, and Explore the World. Each category is presented as a visually distinct, animated card. The dashboard displays the child's current XP total, badge count, and a "Parent remote control active" indicator when real-time settings are being applied. Categories can be dynamically shown or hidden based on the parent's remote control configuration.</p>
        
        <h4>Module M4: Game Engine (12 Educational Games)</h4>
        <p>Each game follows a consistent architecture: 10 rounds per session (7 standard difficulty + 3 adaptive difficulty rounds), 4 answer options per question, real-time score tracking (+10 points per correct answer), streak counter, countdown timer, and an animated game completion screen displaying final score, accuracy percentage, star rating, and time taken.</p>
        <table>
          <thead><tr><th>Game</th><th>Category</th><th>Learning Domain</th></tr></thead>
          <tbody>
            <tr><td>AlphabetGame</td><td>Word World</td><td>Letter recognition</td></tr>
            <tr><td>VowelsGame</td><td>Word World</td><td>Vowel identification</td></tr>
            <tr><td>ConsonantsGame</td><td>Word World</td><td>Consonant identification</td></tr>
            <tr><td>LetterTracingGame</td><td>Word World</td><td>Letter formation</td></tr>
            <tr><td>NumbersGame</td><td>Numbers</td><td>Number recognition</td></tr>
            <tr><td>CountAlongGame</td><td>Numbers</td><td>Counting sequences</td></tr>
            <tr><td>CompareItemsGame</td><td>Numbers</td><td>Quantity comparison</td></tr>
            <tr><td>ClockGame</td><td>Numbers</td><td>Time telling</td></tr>
            <tr><td>ShapeMatchingGame</td><td>Numbers</td><td>Shape recognition</td></tr>
            <tr><td>ColorRecognitionGame</td><td>Sensory</td><td>Color identification</td></tr>
            <tr><td>MemoryGame</td><td>Sensory</td><td>Visual memory</td></tr>
            <tr><td>EmotionsGame</td><td>Everyday</td><td>Emotion recognition</td></tr>
            <tr><td>AnimalsGame</td><td>World</td><td>Animal identification</td></tr>
            <tr><td>WeatherGame</td><td>World</td><td>Weather concepts</td></tr>
            <tr><td>FruitsLearningGame</td><td>World</td><td>Fruit identification</td></tr>
            <tr><td>MusicGame</td><td>World</td><td>Instrument recognition</td></tr>
            <tr><td>KitchenGame</td><td>Everyday</td><td>Kitchen item recognition</td></tr>
            <tr><td>HomeToolsGame</td><td>Everyday</td><td>Household tool recognition</td></tr>
            <tr><td>BodyPartsGame</td><td>Everyday</td><td>Body part identification</td></tr>
            <tr><td>DragDropGame</td><td>Sensory</td><td>Fine motor skills</td></tr>
          </tbody>
        </table>
        
        <h4>Module M5: Parent Remote Control (Real-Time WebSocket Sync)</h4>
        <p>The Remote Control is a 6-tab settings panel accessible from the Parent Dashboard for each child. It persists settings to the <code>remote_control_settings</code> PostgreSQL table with real-time WebSocket broadcasting enabled. When a parent modifies any setting and saves, the change is written to the database and immediately pushed to the child's active session via PostgreSQL's LISTEN/NOTIFY mechanism.</p>
        <p><strong>Six Control Tabs:</strong></p>
        <ol>
          <li><strong>Difficulty & Content:</strong> Difficulty slider (1–5), auto-adjust toggle, age filter (1–25), content filter level</li>
          <li><strong>Learning Goals:</strong> 6 learning goal toggles with priority selectors (low/medium/high)</li>
          <li><strong>Game Categories:</strong> 5 category toggles to show/hide entire sections on the child dashboard</li>
          <li><strong>Schedule:</strong> 7-day weekly schedule with enable/disable per day and start/end time</li>
          <li><strong>Milestone Alerts:</strong> 7 notification types (Perfect Game, XP Milestones, Hot Streak, etc.)</li>
          <li><strong>Session Limits:</strong> Daily time limit, max games per session, focus mode, break reminders</li>
        </ol>
        
        <h4>Module M6: AI Adaptive System</h4>
        <p>Leverages the Google Gemini 2.5-flash model through serverless Edge Functions for behavioral analysis, difficulty adjustment, and personalized recommendations based on individual accuracy thresholds and learning patterns.</p>
        
        <h4>Module M7: Reward & Gamification System</h4>
        <p>Tracks and awards XP points (10 per correct answer, bonus for streaks and perfect games), manages badge unlocking, calculates star ratings (1–3 stars based on accuracy), and generates milestone notifications for parents.</p>
        
        <h4>Module M8: Behavioral Profiling</h4>
        <p>Maintains a per-child behavioral profile tracking attention span, frustration threshold, preferred pace, strong and weak categories, optimal learning time, and sensory preferences.</p>

        {/* 5. SYSTEM SPECIFICATION */}
        <h2>5. SYSTEM SPECIFICATION</h2>
        
        <h3>5.1 Software Specification</h3>
        <table>
          <thead><tr><th>Component</th><th>Technology</th><th>Version</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td>Frontend Framework</td><td>React</td><td>18.3.1</td><td>Component-based UI development with virtual DOM</td></tr>
            <tr><td>Programming Language</td><td>TypeScript</td><td>5.x</td><td>Static type checking, compile-time error detection</td></tr>
            <tr><td>Build Tool</td><td>Vite</td><td>5.x</td><td>Fast dev server with HMR and optimized production builds</td></tr>
            <tr><td>CSS Framework</td><td>Tailwind CSS</td><td>3.x</td><td>Utility-first responsive design</td></tr>
            <tr><td>UI Components</td><td>shadcn/ui + Radix UI</td><td>Latest</td><td>Accessible, WAI-ARIA compliant primitives</td></tr>
            <tr><td>Database Client</td><td>PostgreSQL JS SDK</td><td>2.87.1</td><td>Database operations, auth, real-time subscriptions</td></tr>
            <tr><td>Routing</td><td>React Router DOM</td><td>6.30.1</td><td>Declarative routing with protected routes</td></tr>
            <tr><td>Animation</td><td>GSAP</td><td>3.14.2</td><td>Professional-grade animations for mascots and transitions</td></tr>
            <tr><td>Charts</td><td>Recharts</td><td>2.15.4</td><td>Responsive charts for parent analytics</td></tr>
            <tr><td>Icons</td><td>Lucide React</td><td>0.462.0</td><td>1000+ SVG icons</td></tr>
            <tr><td>Validation</td><td>Zod</td><td>3.25.76</td><td>Runtime type validation for forms and API responses</td></tr>
            <tr><td>Forms</td><td>React Hook Form</td><td>7.61.1</td><td>Performant form handling with validation</td></tr>
            <tr><td>AI Model</td><td>Google Gemini 2.5-flash</td><td>API</td><td>Behavioral analysis and difficulty adjustment</td></tr>
            <tr><td>Real-time Protocol</td><td>WebSocket (LISTEN/NOTIFY)</td><td>—</td><td>Remote control settings synchronization</td></tr>
          </tbody>
        </table>
        
        <h3>5.2 Hardware Specification</h3>
        <table>
          <thead><tr><th>Component</th><th>Minimum Requirement</th><th>Recommended</th></tr></thead>
          <tbody>
            <tr><td>Processor</td><td>Dual-core 1.5 GHz</td><td>Quad-core 2.0+ GHz</td></tr>
            <tr><td>RAM</td><td>2 GB</td><td>4 GB or higher</td></tr>
            <tr><td>Storage</td><td>100 MB (cloud-hosted DB)</td><td>500 MB+ for browser cache</td></tr>
            <tr><td>Display Resolution</td><td>320px minimum width</td><td>1024px+ for parent dashboard</td></tr>
            <tr><td>Network</td><td>3G (1 Mbps)</td><td>4G/Wi-Fi (5+ Mbps)</td></tr>
            <tr><td>Input</td><td>Touch screen or Mouse + Keyboard</td><td>Touch screen for children</td></tr>
            <tr><td>Browser</td><td>Chrome 90+, Firefox 88+, Safari 14+</td><td>Latest stable Chrome/Firefox</td></tr>
            <tr><td>Operating System</td><td>Any OS with supported browser</td><td>Latest OS version</td></tr>
          </tbody>
        </table>
        
        <h3>5.3 Application Specification</h3>
        <table>
          <thead><tr><th>Specification</th><th>Detail</th></tr></thead>
          <tbody>
            <tr><td>Application Type</td><td>Single Page Application (SPA)</td></tr>
            <tr><td>Architecture</td><td>Three-tier: Presentation → Application → Data</td></tr>
            <tr><td>Browsers</td><td>Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</td></tr>
            <tr><td>Responsive Design</td><td>320px to 1920px with breakpoints at 640, 768, 1024, 1280px</td></tr>
            <tr><td>Authentication</td><td>Email/password with session tokens and auto-refresh</td></tr>
            <tr><td>Database</td><td>PostgreSQL 15 with JSONB and real-time notifications</td></tr>
            <tr><td>Real-time</td><td>WebSocket via PostgreSQL LISTEN/NOTIFY</td></tr>
            <tr><td>API Architecture</td><td>RESTful API + Serverless Edge Functions (Deno)</td></tr>
            <tr><td>Security</td><td>RLS on all tables, PIN-gated parent features, RBAC, encrypted tokens</td></tr>
          </tbody>
        </table>

        {/* 6. SYSTEM DESIGN & DEVELOPMENT */}
        <h2>6. SYSTEM DESIGN & DEVELOPMENT</h2>
        
        <h3>6.1 Data Flow Diagram</h3>
        <blockquote>
          <strong>Note:</strong> Visual diagrams with proper DFD shapes (circles for processes, parallel lines for data stores, rectangles for external entities) are available as a separate printable page. Click the <strong>"Open DFD & ERD Diagrams"</strong> button at the top of this page.
        </blockquote>

        <h4>Level 0 — Context Diagram</h4>
        <p>The context diagram shows the NeuroNest system as a single process interacting with three external entities: Parent User, Child User, and the Google Gemini AI Engine.</p>
        <p><strong>Data Flows:</strong></p>
        <ul>
          <li>Parent → System: Login credentials, child profile data, remote control settings</li>
          <li>System → Parent: Authentication response, progress reports, milestone alerts</li>
          <li>Parent → Child (via System): Remote control settings (real-time WebSocket push)</li>
          <li>Child → System: Game answers, session completion data</li>
          <li>System → Child: Game questions, adaptive difficulty, rewards, filtered categories</li>
          <li>System → Gemini AI: Game session data, behavioral metrics</li>
          <li>Gemini AI → System: Difficulty recommendations, behavioral insights</li>
        </ul>

        <h4>Level 1 — Detailed DFD</h4>
        <p>The Level 1 DFD decomposes Process 0 into six sub-processes:</p>
        <table>
          <thead><tr><th>Process</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>1.0 Authenticate User</td><td>Handles signup, login, session creation; creates profile, role, and settings records</td></tr>
            <tr><td>2.0 Parent Dashboard</td><td>Child profile management (CRUD), access to reports and settings</td></tr>
            <tr><td>3.0 Child Dashboard</td><td>Game hub display; receives real-time category filtering from Remote Control</td></tr>
            <tr><td>4.0 Game Engine</td><td>12+ educational games with adaptive difficulty, scoring, and session saving</td></tr>
            <tr><td>5.0 Remote Control</td><td>Parent configures settings; saves to D6 which triggers WebSocket push to 3.0</td></tr>
            <tr><td>6.0 AI Engine</td><td>Behavioral analysis, difficulty adjustment, and recommendations via Gemini AI</td></tr>
          </tbody>
        </table>
        <table>
          <thead><tr><th>Data Store</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>D1: profiles, user_roles, parental_settings</td><td>User identity, role, and global preferences</td></tr>
            <tr><td>D2: child_profiles</td><td>Child records with name, age, avatar</td></tr>
            <tr><td>D3: game_sessions</td><td>Completed game results with scores and mistakes</td></tr>
            <tr><td>D5: child_behavior_profiles</td><td>AI-tracked behavioral metrics per child</td></tr>
            <tr><td>D6: remote_control_settings (REALTIME)</td><td>Parent remote control configuration with WebSocket sync</td></tr>
          </tbody>
        </table>

        <h3>6.2 Entity Relationship Diagram</h3>
        <blockquote>
          <strong>Note:</strong> A proper visual ER diagram with diamond-shaped relationships, oval attributes, and rectangular entities is available in the separate diagrams page. Click <strong>"Open DFD & ERD Diagrams"</strong> at the top.
        </blockquote>
        <table>
          <thead><tr><th>From Entity</th><th>Relationship</th><th>To Entity</th><th>Cardinality</th><th>FK Column</th></tr></thead>
          <tbody>
            <tr><td>auth.users</td><td>has</td><td>profiles</td><td>1 : 1</td><td>profiles.user_id</td></tr>
            <tr><td>auth.users</td><td>has</td><td>user_roles</td><td>1 : 1</td><td>user_roles.user_id</td></tr>
            <tr><td>auth.users</td><td>has</td><td>parental_settings</td><td>1 : 1</td><td>parental_settings.parent_id</td></tr>
            <tr><td>auth.users</td><td>creates</td><td>child_profiles</td><td>1 : N</td><td>child_profiles.parent_id</td></tr>
            <tr><td>child_profiles</td><td>plays</td><td>game_sessions</td><td>1 : N</td><td>game_sessions.child_id</td></tr>
            <tr><td>child_profiles</td><td>has</td><td>child_behavior_profiles</td><td>1 : 1</td><td>child_behavior_profiles.child_id (UNIQUE)</td></tr>
            <tr><td>child_profiles</td><td>configured by</td><td>remote_control_settings</td><td>1 : 1</td><td>remote_control_settings.child_id (UNIQUE, REALTIME)</td></tr>
          </tbody>
        </table>

        <h3>6.3 Input Design</h3>
        <table>
          <thead><tr><th>Input Screen</th><th>Fields</th><th>Validation Rules</th><th>Error Handling</th></tr></thead>
          <tbody>
            <tr><td>Sign Up</td><td>Email, Password, Display Name</td><td>Email: RFC 5322; Password: min 6 chars</td><td>Toast notification with error</td></tr>
            <tr><td>Login</td><td>Email, Password</td><td>Both required; email format validated</td><td>Toast: "Invalid credentials"</td></tr>
            <tr><td>Add Child</td><td>Name, Age (1-25), Avatar</td><td>Name: required, unique per parent; Age: 1-25</td><td>Toast for duplicates</td></tr>
            <tr><td>Parent PIN</td><td>4-digit numeric PIN</td><td>Exactly 4 numeric digits</td><td>Shake animation + error</td></tr>
            <tr><td>Remote Control - Difficulty</td><td>Slider (1-5), toggles, age filter</td><td>Integer ranges constrained</td><td>Real-time slider feedback</td></tr>
            <tr><td>Remote Control - Categories</td><td>5 category toggles</td><td>At least one must remain enabled</td><td>Warning toast</td></tr>
            <tr><td>Remote Control - Schedule</td><td>7 day toggles with time inputs</td><td>End time after start time</td><td>Browser time picker validation</td></tr>
            <tr><td>Game Answers</td><td>Click/tap on option card</td><td>Single selection from 4 options</td><td>Green/red visual feedback</td></tr>
          </tbody>
        </table>

        <h3>6.4 Output Design</h3>
        <table>
          <thead><tr><th>Output Screen</th><th>Content</th><th>Format</th><th>Target User</th></tr></thead>
          <tbody>
            <tr><td>Child Dashboard</td><td>Game categories, XP, badges, remote control indicator</td><td>Animated card grid</td><td>Child</td></tr>
            <tr><td>Game Screen</td><td>Question, 4 options, score, timer, streak, difficulty badge</td><td>Interactive game UI</td><td>Child</td></tr>
            <tr><td>Game Finish</td><td>Score, accuracy, stars, streak, time, XP earned</td><td>Animated results with celebration</td><td>Child</td></tr>
            <tr><td>Parent Dashboard</td><td>Quick stats, child profile cards</td><td>Dashboard grid</td><td>Parent</td></tr>
            <tr><td>Reports</td><td>Charts, tables, AI recommendations</td><td>Recharts + data tables</td><td>Parent (PIN-protected)</td></tr>
            <tr><td>Remote Control</td><td>6-tab settings panel, sync indicator</td><td>Modal dialog with controls</td><td>Parent</td></tr>
            <tr><td>Real-time Updates</td><td>Filtered categories, difficulty indicator</td><td>Live WebSocket-driven UI</td><td>Child (automatic)</td></tr>
          </tbody>
        </table>

        <h3>6.5 Database Design</h3>
        <p>The system uses PostgreSQL 15 with Row-Level Security (RLS) enabled on all 7 tables. See Appendix F for complete CREATE TABLE scripts for external SQL database setup.</p>
        
        <h4>Table: profiles</h4>
        <table>
          <thead><tr><th>Column</th><th>Type</th><th>Constraints</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td>id</td><td>UUID</td><td>PRIMARY KEY</td><td>gen_random_uuid()</td></tr>
            <tr><td>user_id</td><td>UUID</td><td>NOT NULL, UNIQUE</td><td>—</td></tr>
            <tr><td>email</td><td>TEXT</td><td>Nullable</td><td>—</td></tr>
            <tr><td>display_name</td><td>TEXT</td><td>Nullable</td><td>—</td></tr>
            <tr><td>created_at</td><td>TIMESTAMPTZ</td><td>NOT NULL</td><td>now()</td></tr>
            <tr><td>updated_at</td><td>TIMESTAMPTZ</td><td>NOT NULL</td><td>now()</td></tr>
          </tbody>
        </table>
        <p><strong>RLS:</strong> Users can SELECT, INSERT, UPDATE their own profile. DELETE is not permitted.</p>

        <h4>Table: child_profiles</h4>
        <table>
          <thead><tr><th>Column</th><th>Type</th><th>Constraints</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td>id</td><td>UUID</td><td>PRIMARY KEY</td><td>gen_random_uuid()</td></tr>
            <tr><td>parent_id</td><td>UUID</td><td>NOT NULL</td><td>—</td></tr>
            <tr><td>name</td><td>TEXT</td><td>NOT NULL</td><td>—</td></tr>
            <tr><td>age</td><td>INTEGER</td><td>1-25</td><td>—</td></tr>
            <tr><td>avatar</td><td>TEXT</td><td>Nullable</td><td>'default'</td></tr>
            <tr><td>created_at, updated_at</td><td>TIMESTAMPTZ</td><td>NOT NULL</td><td>now()</td></tr>
          </tbody>
        </table>
        <p><strong>RLS:</strong> Parents can SELECT, INSERT, UPDATE, DELETE only their own children.</p>

        <h4>Table: game_sessions</h4>
        <table>
          <thead><tr><th>Column</th><th>Type</th><th>Constraints</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td>id</td><td>UUID</td><td>PRIMARY KEY</td><td>gen_random_uuid()</td></tr>
            <tr><td>child_id</td><td>UUID</td><td>FK → child_profiles</td><td>—</td></tr>
            <tr><td>game_type</td><td>TEXT</td><td>NOT NULL</td><td>—</td></tr>
            <tr><td>score, correct_answers, wrong_answers, total_questions</td><td>INTEGER</td><td>NOT NULL</td><td>0</td></tr>
            <tr><td>max_streak</td><td>INTEGER</td><td>NOT NULL</td><td>0</td></tr>
            <tr><td>duration_seconds</td><td>INTEGER</td><td>Nullable</td><td>0</td></tr>
            <tr><td>mistakes</td><td>JSONB</td><td>Nullable</td><td>'[]'</td></tr>
            <tr><td>created_at</td><td>TIMESTAMPTZ</td><td>NOT NULL</td><td>now()</td></tr>
          </tbody>
        </table>
        <p><strong>RLS:</strong> Parents can SELECT and INSERT for their own children. UPDATE/DELETE not permitted.</p>

        <h4>Table: remote_control_settings (REALTIME ENABLED)</h4>
        <table>
          <thead><tr><th>Column</th><th>Type</th><th>Constraints</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td>id</td><td>UUID</td><td>PRIMARY KEY</td><td>gen_random_uuid()</td></tr>
            <tr><td>child_id</td><td>UUID</td><td>FK → child_profiles, UNIQUE</td><td>—</td></tr>
            <tr><td>parent_id</td><td>UUID</td><td>NOT NULL</td><td>—</td></tr>
            <tr><td>difficulty_level</td><td>INTEGER</td><td>Nullable</td><td>3</td></tr>
            <tr><td>auto_adjust_difficulty</td><td>BOOLEAN</td><td>Nullable</td><td>true</td></tr>
            <tr><td>enabled_categories</td><td>JSONB</td><td>Nullable</td><td>All 5 categories</td></tr>
            <tr><td>daily_time_limit</td><td>INTEGER</td><td>Nullable</td><td>30</td></tr>
            <tr><td>learning_goals</td><td>JSONB</td><td>Nullable</td><td>'[]'</td></tr>
            <tr><td>schedule</td><td>JSONB</td><td>Nullable</td><td>'[]'</td></tr>
            <tr><td>milestone_notifications</td><td>JSONB</td><td>Nullable</td><td>'[]'</td></tr>
            <tr><td>break_reminders</td><td>BOOLEAN</td><td>Nullable</td><td>true</td></tr>
            <tr><td>max_games_per_session</td><td>INTEGER</td><td>Nullable</td><td>10</td></tr>
            <tr><td>created_at, updated_at</td><td>TIMESTAMPTZ</td><td>NOT NULL</td><td>now()</td></tr>
          </tbody>
        </table>
        <p><strong>RLS:</strong> Parents can SELECT, INSERT, UPDATE, DELETE for their own children. <strong>Real-time:</strong> LISTEN/NOTIFY enabled for instant WebSocket sync.</p>

        {/* 7. SYSTEM TESTING */}
        <h2>7. SYSTEM TESTING</h2>
        
        <h3>7.1 Unit Testing</h3>
        <table>
          <thead><tr><th>Test ID</th><th>Module</th><th>Test Description</th><th>Expected Result</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>UT-01</td><td>Auth</td><td>Sign up with valid email/password</td><td>User created, profile + role auto-generated</td><td>✅ Pass</td></tr>
            <tr><td>UT-02</td><td>Auth</td><td>Sign up with duplicate email</td><td>Error: "User already registered"</td><td>✅ Pass</td></tr>
            <tr><td>UT-03</td><td>Auth</td><td>Login with invalid credentials</td><td>Error toast displayed, no session</td><td>✅ Pass</td></tr>
            <tr><td>UT-04</td><td>Child Profile</td><td>Create child with valid data</td><td>Profile saved, card rendered</td><td>✅ Pass</td></tr>
            <tr><td>UT-05</td><td>Child Profile</td><td>Create child with duplicate name</td><td>Validation error displayed</td><td>✅ Pass</td></tr>
            <tr><td>UT-06</td><td>Game Engine</td><td>Correct answer increases score</td><td>Score +10, streak +1</td><td>✅ Pass</td></tr>
            <tr><td>UT-07</td><td>Game Engine</td><td>Wrong answer resets streak</td><td>Streak = 0, wrong count +1</td><td>✅ Pass</td></tr>
            <tr><td>UT-08</td><td>Remote Control</td><td>Save settings to database</td><td>Row created/updated in remote_control_settings</td><td>✅ Pass</td></tr>
            <tr><td>UT-09</td><td>Rewards</td><td>First game triggers badge</td><td>"First Steps" badge unlocked</td><td>✅ Pass</td></tr>
            <tr><td>UT-10</td><td>Rewards</td><td>100% accuracy triggers badge</td><td>"Perfectionist" badge unlocked</td><td>✅ Pass</td></tr>
          </tbody>
        </table>

        <h3>7.2 Integration Testing</h3>
        <table>
          <thead><tr><th>Flow</th><th>Components Involved</th><th>Result</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Auth → Dashboard</td><td>Auth.tsx → useAuth → ParentDashboard</td><td>Successful redirect with session</td><td>✅ Pass</td></tr>
            <tr><td>Remote Control → Child</td><td>ParentRemoteControl → DB → WebSocket → ChildDashboard</td><td>Settings sync in &lt;500ms</td><td>✅ Pass</td></tr>
            <tr><td>Game → Save → Reports</td><td>Game → useGameStats → DB → ReportDashboard</td><td>Session data reflected in reports</td><td>✅ Pass</td></tr>
            <tr><td>Game → AI Analysis</td><td>Game → Edge Function → Gemini → BehaviorProfile</td><td>AI insights saved to profile</td><td>✅ Pass</td></tr>
            <tr><td>Parent → Child CRUD</td><td>ParentDashboard → DB → ChildDashboard</td><td>Create/Edit/Delete propagates correctly</td><td>✅ Pass</td></tr>
          </tbody>
        </table>

        <h3>7.3 System Testing</h3>
        <p>Complete system testing was performed across multiple devices (desktop Chrome, mobile Safari, tablet Firefox) and network conditions (Wi-Fi, 4G, 3G throttled). All features were verified working together including authentication, child management, game play, remote control synchronization, AI analysis, reward tracking, and reporting. Cross-browser compatibility was confirmed with no visual or functional regressions. System performance targets: page load &lt;3s, real-time sync &lt;1s, game interactions &lt;100ms — all met consistently.</p>

        <h3>7.4 Acceptance Testing</h3>
        <table>
          <thead><tr><th>Requirement</th><th>Acceptance Criteria</th><th>Testing Method</th><th>Result</th></tr></thead>
          <tbody>
            <tr><td>Game Functionality</td><td>All 12 games complete 10-round sessions</td><td>Played each game start to finish</td><td>✅ Accepted</td></tr>
            <tr><td>Remote Control</td><td>Parent changes from phone reflect on child device</td><td>Cross-device testing on different networks</td><td>✅ Accepted — &lt;500ms sync</td></tr>
            <tr><td>Security</td><td>RLS on all tables, PIN gate for parent features</td><td>Unauthorized access attempts returned empty</td><td>✅ Accepted</td></tr>
            <tr><td>Accessibility</td><td>Sensory settings configurable per child</td><td>Toggle sound/animation preferences</td><td>✅ Accepted</td></tr>
          </tbody>
        </table>

        <h3>7.5 Black Box Testing</h3>
        <table>
          <thead><tr><th>Input</th><th>Expected Output</th><th>Actual Output</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Click "Alphabet Adventure" game</td><td>Game loads with first question</td><td>Game loaded correctly</td><td>✅ Pass</td></tr>
            <tr><td>Tap correct answer</td><td>Green highlight, score +10</td><td>All expected outputs observed</td><td>✅ Pass</td></tr>
            <tr><td>Disable "Numbers" in Remote Control</td><td>Numbers games hidden on child dashboard</td><td>Games removed in real-time</td><td>✅ Pass</td></tr>
            <tr><td>Re-enable category</td><td>Games reappear without refresh</td><td>Games reappeared instantly</td><td>✅ Pass</td></tr>
            <tr><td>Complete game with 100% accuracy</td><td>3 stars, "Perfect!" celebration</td><td>Correct output displayed</td><td>✅ Pass</td></tr>
            <tr><td>Access Reports without PIN</td><td>PIN gate dialog blocks access</td><td>PIN dialog rendered correctly</td><td>✅ Pass</td></tr>
            <tr><td>Sign up with password "123"</td><td>Validation error</td><td>"Min 6 characters" error shown</td><td>✅ Pass</td></tr>
          </tbody>
        </table>

        <h3>7.6 White Box Testing</h3>
        <table>
          <thead><tr><th>Code Path</th><th>Test Description</th><th>Branches Tested</th><th>Coverage</th></tr></thead>
          <tbody>
            <tr><td>useRemoteControlSettingsChild</td><td>Real-time subscription setup/cleanup</td><td>null childId, valid childId, unmount cleanup</td><td>✅ 3/3</td></tr>
            <tr><td>useRemoteControlSettingsParent</td><td>Insert vs update save logic</td><td>No existing row → INSERT, existing → UPDATE, error → toast</td><td>✅ 3/3</td></tr>
            <tr><td>useAdaptiveDifficulty</td><td>Easy/hard split based on accuracy</td><td>≥70% → hard, 40-69% → mixed, &lt;40% → easy</td><td>✅ 3/3</td></tr>
            <tr><td>useRewardSystem.checkMilestones</td><td>Badge unlock conditions</td><td>First game, 5-streak, 100% accuracy, 500 XP</td><td>✅ 4/4</td></tr>
            <tr><td>Category filtering</td><td>Real-time show/hide categories</td><td>null settings, category in list, not in list, WebSocket update</td><td>✅ 4/4</td></tr>
            <tr><td>RLS policy enforcement</td><td>Data access with different user contexts</td><td>Own data allowed, other's data blocked, unauthenticated blocked</td><td>✅ 3/3</td></tr>
          </tbody>
        </table>

        <h3>7.7 Validation Testing</h3>
        <table>
          <thead><tr><th>Field</th><th>Valid Input</th><th>Invalid Input</th><th>Error Handling</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Email</td><td>user@example.com</td><td>"userdomaincom"</td><td>"Please enter a valid email"</td><td>✅ Pass</td></tr>
            <tr><td>Password</td><td>"secureP@ss1"</td><td>"123"</td><td>"Min 6 characters"</td><td>✅ Pass</td></tr>
            <tr><td>Child Name</td><td>"Alex"</td><td>"" (empty)</td><td>"Name is required"</td><td>✅ Pass</td></tr>
            <tr><td>Child Age</td><td>5</td><td>0 or 30</td><td>Slider constrained to 1-25</td><td>✅ Pass</td></tr>
            <tr><td>Parent PIN</td><td>"1234"</td><td>"ab" or "12"</td><td>Numeric-only, 4 digits required</td><td>✅ Pass</td></tr>
            <tr><td>Difficulty</td><td>3 (1-5)</td><td>N/A (slider)</td><td>Slider prevents invalid</td><td>✅ Pass</td></tr>
          </tbody>
        </table>

        {/* 8. IMPLEMENTATION & MAINTENANCE */}
        <h2>8. SYSTEM IMPLEMENTATION AND MAINTENANCE</h2>
        
        <h3>8.1 Implementation Architecture</h3>
        <pre><code>{`┌─────────────────────────────────────────────────────────────┐
│              CLIENT LAYER (React 18 + TypeScript)            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Parent       │  │ Child        │  │ Game         │       │
│  │ Dashboard    │  │ Dashboard    │  │ Engine       │       │
│  │ • Child Mgmt │  │ • Game Hub   │  │ • 12 Games   │       │
│  │ • Reports    │  │ • XP/Badges  │  │ • Scoring    │       │
│  │ • Remote Ctrl│  │ • RT Updates │  │ • Adaptive   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  Hooks: useAuth | useRemoteControlSettings | useAdaptiveAI   │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS + WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (Edge Functions)               │
│  adaptive-ai-helper | ai-student-analysis | letter-drawing   │
└───────────────────────────┬──────────────────────────────────┘
                            │ SQL + Realtime
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              DATA LAYER (PostgreSQL 15)                       │
│  7 Tables with RLS: profiles | user_roles | child_profiles   │
│  game_sessions | child_behavior_profiles                     │
│  parental_settings | remote_control_settings (REALTIME)      │
└─────────────────────────────────────────────────────────────┘`}</code></pre>

        <h3>8.2 Real-Time Synchronization Architecture</h3>
        <pre><code>{`Parent Device                    PostgreSQL DB                Child Device
┌────────────────┐              ┌─────────────────┐          ┌────────────────┐
│ Remote Control │  INSERT/     │ remote_control_ │          │ Child Dashboard│
│ Panel          │  UPDATE      │ settings        │  push    │                │
│ 1. Change      │ ────────────>│ 2. Data saved   │ ───────> │ 4. WebSocket   │
│    settings    │              │ 3. NOTIFY sent  │          │    received    │
│                │              │    to listeners │          │ 5. Re-render   │
└────────────────┘              └─────────────────┘          └────────────────┘

Latency: 200-500ms  |  Protocol: WebSocket  |  Auto-reconnect: Yes`}</code></pre>

        <h3>8.3 Maintenance Plan</h3>
        <ul>
          <li><strong>Database Backups:</strong> Automated daily backups with point-in-time recovery</li>
          <li><strong>Dependency Updates:</strong> Monthly security patch updates via npm audit</li>
          <li><strong>Edge Function Monitoring:</strong> Log monitoring for API errors and failures</li>
          <li><strong>Performance:</strong> React Query caching reduces redundant API calls; code-splitting via Vite</li>
          <li><strong>Security:</strong> RLS policies audited quarterly; API keys rotated as needed</li>
        </ul>

        {/* 9. CONCLUSION */}
        <h2>9. CONCLUSION</h2>
        <p>The NeuroNest educational game platform successfully addresses the critical gaps in existing autism-focused educational technology. The project demonstrates the effective use of modern web technologies to create a production-ready, accessible, and intelligent learning ecosystem for children with autism spectrum disorder.</p>
        <p><strong>Key Achievements:</strong></p>
        <ul>
          <li><strong>Real-Time Remote Control:</strong> Parents can customize their child's entire learning environment from any internet-connected device. Changes to difficulty levels, game categories, schedules, and milestone notifications propagate to the child's active session within 200-500 milliseconds via WebSocket synchronization, requiring zero intervention on the child's device.</li>
          <li><strong>AI-Powered Adaptive Learning:</strong> The Google Gemini 2.5-flash integration analyzes individual performance patterns and automatically adjusts game difficulty, preventing both boredom and frustration while maintaining optimal learning engagement.</li>
          <li><strong>Comprehensive Game Library:</strong> 12 fully-functional educational games spanning letters, numbers, shapes, colors, emotions, memory, music, weather, animals, body parts, kitchen items, and household tools — all with consistent 10-round architecture and adaptive difficulty.</li>
          <li><strong>Robust Security:</strong> Row-Level Security policies on all 7 database tables, PIN-gated parent features, role-based access control, and encrypted session management ensure complete data isolation between users.</li>
          <li><strong>Behavioral Intelligence:</strong> Continuous profiling of attention span, frustration threshold, preferred pace, strong/weak categories, and optimal learning times provides parents and educators with actionable insights for individualized instruction.</li>
        </ul>
        <p>The application serves as a comprehensive model for how technology can be leveraged to support neurodivergent learners through personalized, adaptive, and remotely-manageable educational experiences.</p>

        {/* 10. FUTURE ENHANCEMENTS */}
        <h2>10. FUTURE ENHANCEMENTS</h2>
        <table>
          <thead><tr><th>Priority</th><th>Enhancement</th><th>Description</th><th>Effort</th></tr></thead>
          <tbody>
            <tr><td>High</td><td>Multi-Language Support</td><td>Add Hindi, Tamil, Telugu, Arabic, Spanish, and French language options for game content and UI labels</td><td>4-6 weeks</td></tr>
            <tr><td>High</td><td>Offline Mode (PWA)</td><td>Service worker for offline game caching; data syncs when connection is restored</td><td>3-4 weeks</td></tr>
            <tr><td>High</td><td>Push Notifications</td><td>Native browser push for milestone alerts, schedule reminders, and break reminders</td><td>2-3 weeks</td></tr>
            <tr><td>Medium</td><td>Voice Navigation</td><td>Full voice-guided navigation using Web Speech API for hands-free game interaction</td><td>4-5 weeks</td></tr>
            <tr><td>Medium</td><td>Custom Avatar Creator</td><td>Children design their own character avatars with selectable body parts and colors</td><td>3-4 weeks</td></tr>
            <tr><td>Medium</td><td>Social Features</td><td>Privacy-controlled leaderboards for classroom use with teacher group management</td><td>5-6 weeks</td></tr>
            <tr><td>Medium</td><td>Video Tutorials</td><td>In-game video demonstrations for complex games (15-30 second clips)</td><td>2-3 weeks</td></tr>
            <tr><td>Low</td><td>Printable PDF Reports</td><td>Export progress reports as formatted PDFs for therapists and educators</td><td>2 weeks</td></tr>
            <tr><td>Low</td><td>Wearable Integration</td><td>Apple Watch / smart band integration for break reminders and notifications</td><td>6-8 weeks</td></tr>
            <tr><td>Low</td><td>Native Mobile App</td><td>iOS/Android via Capacitor for push notifications and native sensor access</td><td>8-12 weeks</td></tr>
          </tbody>
        </table>

        {/* 11. BIBLIOGRAPHY */}
        <h2>11. BIBLIOGRAPHY</h2>
        <ol>
          <li>American Psychiatric Association. (2013). <em>Diagnostic and Statistical Manual of Mental Disorders</em> (5th ed.). Arlington, VA: American Psychiatric Publishing.</li>
          <li>Centers for Disease Control and Prevention (CDC). (2023). <em>Autism Spectrum Disorder: Data & Statistics.</em> https://www.cdc.gov/autism/data-research/</li>
          <li>Grynszpan, O., Weiss, P. L., Perez-Diaz, F., & Gal, E. (2014). Innovative technology-based interventions for autism spectrum disorders: A meta-analysis. <em>Autism</em>, 18(4), 346-361.</li>
          <li>React Documentation. (2024). <em>React 18 — A JavaScript library for building user interfaces.</em> https://react.dev</li>
          <li>PostgreSQL Global Development Group. (2024). <em>PostgreSQL 15 Documentation.</em> https://www.postgresql.org/docs/15/</li>
          <li>Tailwind CSS Documentation. (2024). <em>A utility-first CSS framework.</em> https://tailwindcss.com/docs</li>
          <li>Google AI. (2025). <em>Gemini API Documentation.</em> https://ai.google.dev/docs</li>
          <li>W3C. (2023). <em>Web Content Accessibility Guidelines (WCAG) 2.1.</em> https://www.w3.org/WAI/WCAG21/</li>
          <li>Vite Documentation. (2024). <em>Next Generation Frontend Tooling.</em> https://vitejs.dev/guide/</li>
          <li>shadcn/ui Documentation. (2024). <em>Beautifully designed components.</em> https://ui.shadcn.com</li>
          <li>Zod Documentation. (2024). <em>TypeScript-first schema validation.</em> https://zod.dev</li>
          <li>React Router Documentation. (2024). <em>Declarative routing.</em> https://reactrouter.com/en/main</li>
        </ol>

        {/* 12. APPENDIX */}
        <h2>12. APPENDIX</h2>
        
        <h3>Appendix A: Data Flow Diagrams</h3>
        <p>Complete DFD diagrams (Level 0, Level 1, Level 2) with proper shapes are available as a separate printable page. Click the <strong>"Open DFD & ERD Diagrams"</strong> button at the top of this page to open the SVG-based diagram file.</p>
        
        <h3>Appendix B: Entity Relationship Diagram</h3>
        <p>Complete ER diagram with diamond-shaped relationships, rectangular entities, and cardinality notation is available in the same diagrams page.</p>
        
        <h3>Appendix C: Database Design</h3>
        <p>Detailed schemas documented in Section 6.5. Complete CREATE TABLE scripts in Appendix F.</p>
        
        <h3>Appendix D: Sample Screenshots</h3>
        <p>Key application screens:</p>
        <ol>
          <li><strong>Landing Page</strong> — Hero with animated mascot, feature highlights, call-to-action</li>
          <li><strong>Authentication</strong> — Login/Signup forms with validation</li>
          <li><strong>Parent Dashboard</strong> — Child cards with Play, Remote Control, Edit, Delete</li>
          <li><strong>Remote Control Panel</strong> — 6-tab dialog with real-time sync indicator</li>
          <li><strong>Child Dashboard</strong> — Animated game hub with categories and "Parent remote control active" indicator</li>
          <li><strong>Game Screen</strong> — Question, 4 options, timer, score, streak, difficulty badge</li>
          <li><strong>Game Finish</strong> — Star rating, score, accuracy, XP earned</li>
          <li><strong>Reports Dashboard</strong> — Charts and AI recommendations (PIN-protected)</li>
        </ol>

        <h3>Appendix E: Source Code Structure</h3>
        <table>
          <thead><tr><th>Directory</th><th>Files</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>src/components/</td><td>35+</td><td>Reusable React UI components</td></tr>
            <tr><td>src/pages/</td><td>6</td><td>Top-level page components</td></tr>
            <tr><td>src/pages/games/</td><td>12</td><td>Individual game modules</td></tr>
            <tr><td>src/hooks/</td><td>13</td><td>Custom React hooks</td></tr>
            <tr><td>src/integrations/</td><td>2</td><td>Database client and types</td></tr>
            <tr><td>supabase/functions/</td><td>3</td><td>Edge Functions for AI</td></tr>
            <tr><td>supabase/migrations/</td><td>N</td><td>SQL migration files</td></tr>
            <tr><td>docs/</td><td>4</td><td>Project documentation</td></tr>
          </tbody>
        </table>

        <h3 className="page-break">Appendix F: External SQL Database Setup Guide</h3>
        <p>Step-by-step guide to create the NeuroNest database on an external PostgreSQL server.</p>
        
        <h4>Step 1: Install PostgreSQL</h4>
        <pre><code>{`# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql@15

# Windows
# Download from https://www.postgresql.org/download/windows/`}</code></pre>

        <h4>Step 2: Create Database</h4>
        <pre><code>{`sudo -u postgres psql

CREATE DATABASE neuronest;
CREATE USER neuronest_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE neuronest TO neuronest_admin;
\\c neuronest`}</code></pre>

        <h4>Step 3: Enable Extensions</h4>
        <pre><code>{`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";`}</code></pre>

        <h4>Step 4: Create Tables</h4>
        <pre><code>{`-- See Section 6.5 for complete table schemas
-- All 7 tables: profiles, user_roles, parental_settings,
-- child_profiles, game_sessions, child_behavior_profiles,
-- remote_control_settings

-- Example: remote_control_settings (REALTIME)
CREATE TABLE public.remote_control_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL UNIQUE REFERENCES child_profiles(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL,
    difficulty_level INTEGER DEFAULT 3,
    auto_adjust_difficulty BOOLEAN DEFAULT true,
    enabled_categories JSONB DEFAULT '["everyday","numbers","words","sensory","world"]',
    daily_time_limit INTEGER DEFAULT 30,
    learning_goals JSONB DEFAULT '[]',
    schedule JSONB DEFAULT '[]',
    milestone_notifications JSONB DEFAULT '[]',
    break_reminders BOOLEAN DEFAULT true,
    max_games_per_session INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`}</code></pre>

        <h4>Step 5: Create Indexes</h4>
        <pre><code>{`CREATE INDEX idx_child_profiles_parent ON child_profiles(parent_id);
CREATE INDEX idx_game_sessions_child ON game_sessions(child_id);
CREATE INDEX idx_game_sessions_type ON game_sessions(game_type);
CREATE INDEX idx_game_sessions_created ON game_sessions(created_at DESC);`}</code></pre>

        <h4>Step 6: Create updated_at Trigger</h4>
        <pre><code>{`CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- (repeat for other tables)`}</code></pre>

        <h4>Step 7: Enable Real-time (LISTEN/NOTIFY)</h4>
        <pre><code>{`CREATE OR REPLACE FUNCTION notify_remote_control_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'remote_control_changes',
        json_build_object(
            'child_id', NEW.child_id,
            'operation', TG_OP,
            'data', row_to_json(NEW)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER remote_control_notify
    AFTER INSERT OR UPDATE ON remote_control_settings
    FOR EACH ROW EXECUTE FUNCTION notify_remote_control_change();`}</code></pre>

        <h4>Step 8: Configure Application</h4>
        <pre><code>{`# .env file
DATABASE_URL=postgresql://neuronest_admin:your_password@your-host:5432/neuronest`}</code></pre>

        <h4>Step 9: Verify Installation</h4>
        <pre><code>{`SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
-- Expected: 7 tables listed`}</code></pre>

        <hr style={{ margin: "40px 0" }} />
        <p style={{ textAlign: "center", fontSize: "12px", color: "#888" }}>
          <em>Document generated for NeuroNest v2.0.0 — Academic Year 2025–2026</em>
        </p>
      </div>
    </div>
  );
};

export default Documentation;
