'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Form state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [medium, setMedium] = useState('');
  const [artStyle, setArtStyle] = useState('');
  const [tone, setTone] = useState('');
  const [mood, setMood] = useState('');
  const [audience, setAudience] = useState('');
  const [subject, setSubject] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [includeProcess, setIncludeProcess] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(false);
  const [includeEmoji, setIncludeEmoji] = useState(false);
  const [seoOptimized, setSeoOptimized] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setCaption(null);
      setError(null);
    }
  };

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '○' },
    { id: 'tiktok', name: 'TikTok', icon: '◐' },
    { id: 'twitter', name: 'X', icon: '✕' },
    { id: 'reddit', name: 'Reddit', icon: '◉' },
    { id: 'artstation', name: 'ArtStation', icon: '◈' },
    { id: 'deviantart', name: 'DeviantArt', icon: '◆' },
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        const res = await fetch('/api/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Image,
            platforms: selectedPlatforms,
            formData: {
              medium,
              artStyle,
              tone,
              mood,
              audience,
              subject,
              customContext,
              options: {
                includeProcess,
                includeHashtags,
                includeCTA,
                includeEmoji,
                seoOptimized,
              }
            }
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate');
        setCaption(data.caption);
      };
      reader.readAsDataURL(image);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = image && selectedPlatforms.length > 0 && medium;

  // Theme classes
  const theme = {
    bg: darkMode ? 'bg-[#0A0A0A]' : 'bg-[#FAFAF8]',
    cardBg: darkMode ? 'bg-[#1A1A1A]' : 'bg-white',
    headerBg: darkMode ? 'bg-[#1A1A1A]/80' : 'bg-white/80',
    text: darkMode ? 'text-[#E5E5E5]' : 'text-[#1A1A1A]',
    textSecondary: darkMode ? 'text-[#A0A0A0]' : 'text-[#6B6B6B]',
    textTertiary: darkMode ? 'text-[#707070]' : 'text-[#9B9B9B]',
    border: darkMode ? 'border-[#2A2A2A]' : 'border-gray-200',
    borderHover: darkMode ? 'border-[#3A3A3A]' : 'border-gray-400',
    inputBorder: darkMode ? 'border-[#2A2A2A]' : 'border-gray-300',
    inputBg: darkMode ? 'bg-[#1A1A1A]' : 'bg-white',
    buttonBg: darkMode ? 'bg-[#E5E5E5]' : 'bg-[#1A1A1A]',
    buttonText: darkMode ? 'text-[#0A0A0A]' : 'text-white',
    buttonHover: darkMode ? 'bg-white' : 'bg-black',
    accent: darkMode ? '#E5C278' : '#D4AF37',
    selectedBg: darkMode ? 'bg-[#E5E5E5]' : 'bg-[#1A1A1A]',
    selectedText: darkMode ? 'text-[#0A0A0A]' : 'text-white',
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        h1, h2, h3 {
          font-family: 'Playfair Display', serif;
        }

        .brush-stroke {
          position: relative;
        }
        
        .brush-stroke::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, 
            transparent 0%,
            ${theme.accent} 20%,
            ${theme.accent} 80%,
            transparent 100%
          );
        }

        .art-texture {
          background-image: 
            repeating-linear-gradient(0deg, transparent, transparent 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 2px, ${darkMode ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.03)'} 4px);
        }

        input[type="checkbox"] {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid ${darkMode ? '#3A3A3A' : '#4A4A4A'};
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
          background: ${darkMode ? '#1A1A1A' : 'white'};
        }

        input[type="checkbox"]:checked {
          background: ${darkMode ? '#E5E5E5' : '#1A1A1A'};
          border-color: ${darkMode ? '#E5E5E5' : '#1A1A1A'};
        }

        input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: ${theme.accent};
          font-size: 12px;
          font-weight: bold;
        }

        select, textarea, input[type="file"] {
          transition: all 0.2s ease;
        }

        select:focus, textarea:focus {
          outline: none;
          border-color: ${theme.accent};
          box-shadow: 0 0 0 1px ${theme.accent};
        }

        .platform-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .platform-btn:hover {
          transform: translateY(-2px);
        }

        .platform-btn.selected {
          box-shadow: 0 4px 20px ${darkMode ? 'rgba(229, 194, 120, 0.3)' : 'rgba(212, 175, 55, 0.3)'};
        }

        .theme-toggle {
          transition: all 0.3s ease;
        }
      `}</style>

      <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
        {/* Subtle texture overlay */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none art-texture"></div>

        {/* Header */}
        <header className={`relative ${theme.border} border-b ${theme.headerBg} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <h1 className={`text-5xl md:text-6xl font-light tracking-tight ${theme.text}`}>
                  Caption<span className="font-semibold">My.Art</span>
                </h1>
                <div className="h-2 w-2 rounded-full mt-4" style={{ backgroundColor: theme.accent }}></div>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center gap-6">
                <Link 
                  href="/pricing" 
                  className={`text-sm ${theme.textSecondary} hover:${theme.text} transition font-medium tracking-wide`}
                >
                  Pricing
                </Link>
                <Link 
                  href="/signin" 
                  className={`text-sm ${theme.textSecondary} hover:${theme.text} transition font-medium tracking-wide`}
                >
                  Sign In
                </Link>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`theme-toggle p-3 ${theme.inputBg} ${theme.inputBorder} border-2 rounded-sm hover:${theme.borderHover} flex items-center gap-2`}
                  aria-label="Toggle theme"
                >
                  <span className="text-xl">{darkMode ? '☀' : '☾'}</span>
                </button>
              </div>
            </div>
            <p className={`mt-3 ${theme.textSecondary} text-lg font-light tracking-wide`}>
              Elevate your art with intelligent, platform-optimized captions
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 py-12">
          
          {/* Upload Section */}
          <section className="mb-16">
            <h2 className={`text-3xl font-light ${theme.text} mb-6 brush-stroke inline-block`}>
              Your Artwork
            </h2>
            
            <div className={`mt-8 ${theme.cardBg} border-2 border-dashed ${theme.inputBorder} rounded-sm hover:${theme.borderHover} transition-colors`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              
              {imagePreview ? (
                <div className="relative p-8">
                  <img
                    src={imagePreview}
                    alt="Your artwork"
                    className="max-h-[500px] mx-auto shadow-2xl"
                  />
                  <button
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className={`absolute top-12 right-12 ${darkMode ? 'bg-white/90 hover:bg-white text-black' : 'bg-black/80 hover:bg-black text-white'} rounded-full w-10 h-10 flex items-center justify-center text-lg backdrop-blur-sm transition`}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer block p-20 text-center">
                  <div className={`inline-block mb-4 text-6xl font-light ${theme.textTertiary}`}>+</div>
                  <p className={`text-xl font-light ${theme.textSecondary} mb-2`}>Upload your artwork</p>
                  <p className={`text-sm ${theme.textTertiary} font-light tracking-wide`}>
                    JPG, PNG, GIF, or WEBP • Maximum 10MB
                  </p>
                </label>
              )}
            </div>
          </section>

          {/* Platform Selection */}
          <section className="mb-16">
            <h2 className={`text-3xl font-light ${theme.text} mb-2 brush-stroke inline-block`}>
              Platforms
            </h2>
            <p className={`text-sm ${theme.textTertiary} mt-6 mb-8 font-light`}>
              Select one or more platforms for optimized captions
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  className={`
                    platform-btn relative px-6 py-5 ${theme.cardBg} border-2 rounded-sm text-center
                    ${
                      selectedPlatforms.includes(platform.id)
                        ? `${theme.inputBorder.replace('border-', 'border-[#')} ${theme.selectedBg} ${theme.selectedText} selected`
                        : `${theme.inputBorder} ${theme.textSecondary} hover:${theme.borderHover}`
                    }
                  `}
                >
                  <div className="text-2xl mb-2 font-light">{platform.icon}</div>
                  <div className="text-xs tracking-wider uppercase font-medium">{platform.name}</div>
                  {selectedPlatforms.includes(platform.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
                      <span className={`text-[10px] ${darkMode ? 'text-black' : 'text-black'}`}>✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Art Details */}
          <section className="mb-16">
            <h2 className={`text-3xl font-light ${theme.text} mb-2 brush-stroke inline-block`}>
              Details
            </h2>
            <p className={`text-sm ${theme.textTertiary} mt-6 mb-8 font-light`}>
              Help us understand your work
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Medium */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Medium <span style={{ color: theme.accent }}>*</span>
                </label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select medium</option>
                  <option value="digital">Digital Art</option>
                  <option value="oil">Oil Painting</option>
                  <option value="watercolor">Watercolor</option>
                  <option value="acrylic">Acrylic</option>
                  <option value="pencil">Pencil / Graphite</option>
                  <option value="ink">Ink</option>
                  <option value="charcoal">Charcoal</option>
                  <option value="pastel">Pastel</option>
                  <option value="mixed-media">Mixed Media</option>
                  <option value="3d">3D Art</option>
                  <option value="sculpture">Sculpture</option>
                  <option value="photography">Photography</option>
                  <option value="collage">Collage</option>
                  <option value="pixel-art">Pixel Art</option>
                  <option value="vector">Vector Art</option>
                </select>
              </div>

              {/* Art Style */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Style
                </label>
                <select
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select style</option>
                  <option value="realism">Realism</option>
                  <option value="abstract">Abstract</option>
                  <option value="impressionism">Impressionism</option>
                  <option value="surrealism">Surrealism</option>
                  <option value="anime">Anime / Manga</option>
                  <option value="cartoon">Cartoon</option>
                  <option value="concept-art">Concept Art</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="sci-fi">Science Fiction</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="still-life">Still Life</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="pop-art">Pop Art</option>
                  <option value="street-art">Street Art</option>
                  <option value="gothic">Gothic</option>
                  <option value="cyberpunk">Cyberpunk</option>
                </select>
              </div>

              {/* Tone */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select tone</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="playful">Playful</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="storytelling">Storytelling</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="educational">Educational</option>
                  <option value="provocative">Provocative</option>
                  <option value="humble">Humble</option>
                  <option value="confident">Confident</option>
                </select>
              </div>

              {/* Mood */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Mood
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select mood</option>
                  <option value="dreamy">Dreamy</option>
                  <option value="bold">Bold</option>
                  <option value="melancholic">Melancholic</option>
                  <option value="energetic">Energetic</option>
                  <option value="peaceful">Peaceful</option>
                  <option value="dark">Dark</option>
                  <option value="whimsical">Whimsical</option>
                  <option value="mysterious">Mysterious</option>
                  <option value="joyful">Joyful</option>
                  <option value="nostalgic">Nostalgic</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select audience</option>
                  <option value="collectors">Art Collectors</option>
                  <option value="artists">Fellow Artists</option>
                  <option value="general">General Audience</option>
                  <option value="commissioners">Commissioners</option>
                  <option value="fans">Fans & Followers</option>
                  <option value="industry">Industry Professionals</option>
                </select>
              </div>

              {/* Subject Matter */}
              <div>
                <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} font-light`}
                >
                  <option value="">Select subject</option>
                  <option value="character">Character / Person</option>
                  <option value="creature">Creature / Monster</option>
                  <option value="environment">Environment / Scene</option>
                  <option value="object">Object / Product</option>
                  <option value="nature">Nature</option>
                  <option value="architecture">Architecture</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="food">Food</option>
                  <option value="abstract-concept">Abstract Concept</option>
                  <option value="fan-art">Fan Art</option>
                </select>
              </div>
            </div>

            {/* Additional Context */}
            <div className="mt-8">
              <label className={`block text-xs uppercase tracking-wider ${theme.textSecondary} mb-3 font-medium`}>
                Additional Context
              </label>
              <textarea
                rows={4}
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Share the story behind your work, inspiration, techniques, or any details you'd like to include..."
                className={`w-full px-4 py-3 ${theme.inputBg} border-2 ${theme.inputBorder} rounded-sm ${theme.text} ${darkMode ? 'placeholder-gray-600' : 'placeholder-gray-400'} font-light resize-none`}
              />
              <p className={`text-xs ${theme.textTertiary} mt-2 font-light`}>{customContext.length} characters</p>
            </div>
          </section>

          {/* Caption Options */}
          <section className="mb-16">
            <h2 className={`text-3xl font-light ${theme.text} mb-2 brush-stroke inline-block`}>
              Options
            </h2>
            <p className={`text-sm ${theme.textTertiary} mt-6 mb-8 font-light`}>
              Customize your caption output
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeProcess}
                  onChange={(e) => setIncludeProcess(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className={`text-sm ${theme.text} font-medium`}>Process Details</span>
                  <p className={`text-xs ${theme.textTertiary} font-light mt-1`}>Include information about your creative process</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className={`text-sm ${theme.text} font-medium`}>Hashtags</span>
                  <p className={`text-xs ${theme.textTertiary} font-light mt-1`}>Add relevant, trending hashtags</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeCTA}
                  onChange={(e) => setIncludeCTA(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className={`text-sm ${theme.text} font-medium`}>Call-to-Action</span>
                  <p className={`text-xs ${theme.textTertiary} font-light mt-1`}>Encourage engagement from your audience</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeEmoji}
                  onChange={(e) => setIncludeEmoji(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className={`text-sm ${theme.text} font-medium`}>Emojis</span>
                  <p className={`text-xs ${theme.textTertiary} font-light mt-1`}>Add expressive emojis where appropriate</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={seoOptimized}
                  onChange={(e) => setSeoOptimized(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className={`text-sm ${theme.text} font-medium`}>SEO Optimization</span>
                  <p className={`text-xs ${theme.textTertiary} font-light mt-1`}>Optimize for discoverability and search</p>
                </div>
              </label>
            </div>
          </section>

          {/* Generate Button */}
          <div className={`border-t ${theme.border} pt-12`}>
            <button
              onClick={handleGenerate}
              disabled={loading || !canGenerate}
              className={`w-full md:w-auto px-12 py-4 ${theme.buttonBg} ${theme.buttonText} text-sm uppercase tracking-widest font-medium hover:${theme.buttonHover} disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:tracking-[0.3em]`}
            >
              {loading ? 'Generating...' : 'Generate Caption'}
            </button>
            
            {!canGenerate && image && (
              <p className="text-sm mt-4 font-light" style={{ color: theme.accent }}>
                Please select at least one platform and specify a medium
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className={`mt-12 p-6 ${darkMode ? 'bg-red-950/50 border-l-4 border-red-600' : 'bg-red-50 border-l-4 border-red-600'}`}>
              <p className={`${darkMode ? 'text-red-300' : 'text-red-900'} font-light`}>{error}</p>
            </div>
          )}

          {/* Caption Output */}
          {caption && (
            <div className={`mt-16 border-t ${theme.border} pt-16`}>
              <h2 className={`text-3xl font-light ${theme.text} mb-8 brush-stroke inline-block`}>
                Your Caption
              </h2>
              
              <div className={`${theme.cardBg} border-2 ${theme.inputBorder} p-8`}>
                <pre className={`whitespace-pre-wrap font-light ${theme.text} leading-relaxed text-base`}>
                  {caption}
                </pre>
              </div>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(caption);
                  alert('Caption copied to clipboard');
                }}
                className={`mt-6 px-8 py-3 border-2 ${theme.inputBorder} ${theme.text} text-xs uppercase tracking-widest font-medium hover:${theme.buttonBg} hover:${theme.buttonText} transition-all`}
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className={`border-t ${theme.border} mt-24 py-8`}>
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className={`text-xs ${theme.textTertiary} tracking-wider uppercase font-light`}>
              Crafted for Artists
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}