import React, { useState, useRef, useCallback, useEffect } from 'react';
// Style 1 - Blue hat images
import blueRightImage from '../../assets/style1/blue-right.png';
import blueLeftImage from '../../assets/style1/blue-left.png';
import blueRightTapeImage from '../../assets/style1/blue-right-tape.png';
import blueLeftTapeImage from '../../assets/style1/blue-left-tape.png';
// Style 1 - Orange hat images
import orangeRightImage from '../../assets/style1/orange-right.png';
import orangeLeftImage from '../../assets/style1/orange-left.png';
import orangeRightTapeImage from '../../assets/style1/orange-right-tape.png';
import orangeLeftTapeImage from '../../assets/style1/orange-left-tape.png';
// Style 2 - Hat images
import orangeHatWhiteLogoImage from '../../assets/style2/right-orange-hat-white-logo.png';
import orangeHatBlackLogoImage from '../../assets/style2/right-orange-hat-black-logo.png';
import blueHatWhiteLogoImage from '../../assets/style2/right-blue-hat-white-logo.png';
import blackHatOrangeLogoImage from '../../assets/style2/right-black-hat-orange-logo.png';
// Style 2 - Hat images with tape
import orangeHatWhiteLogoTapeImage from '../../assets/style2/right-orange-hat-white-logo-w-tape.png';
import orangeHatBlackLogoTapeImage from '../../assets/style2/right-orange-hat-black-logo-w-tape.png';
import blueHatWhiteLogoTapeImage from '../../assets/style2/right-blue-hat-white-logo-w-tape.png';
import blackHatOrangeLogoTapeImage from '../../assets/style2/right-black-hat-orange-logo-w-tape.png';
import elizaLogo from '../../assets/Logo_ElizaOS_White_RGB.svg';
import { Position, Transform } from './types';

export const PhotoEditor: React.FC = () => {
    const [baseImage, setBaseImage] = useState<string>('');
    const [hatColor, setHatColor] = useState<'orange' | 'blue'>('orange'); // Orange is default
    const [currentHatImage, setCurrentHatImage] = useState<string>(orangeRightImage);
    const [hasTape, setHasTape] = useState<boolean>(false);
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [styleMode, setStyleMode] = useState<'style1' | 'style2'>('style1'); // Style 1 is default
    const [style2Selection, setStyle2Selection] = useState<'orangeWhiteLogo' | 'orangeBlackLogo' | 'blueWhiteLogo' | 'blackOrangeLogo'>('orangeWhiteLogo'); // Orange White Logo is default for Style 2
    const [transform, setTransform] = useState<Transform>({
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        flipX: false,
    });
    const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [status, setStatus] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStart = useRef<Position>({ x: 0, y: 0 });
    const statusTimeoutRef = useRef<NodeJS.Timeout>();

    // Helper function to get the correct hat image based on color, orientation, and tape
    const getHatImage = useCallback((color: 'orange' | 'blue', flipped: boolean, tape: boolean) => {
        if (color === 'orange') {
            if (flipped) {
                return tape ? orangeLeftTapeImage : orangeLeftImage;
            } else {
                return tape ? orangeRightTapeImage : orangeRightImage;
            }
        } else {
            if (flipped) {
                return tape ? blueLeftTapeImage : blueLeftImage;
            } else {
                return tape ? blueRightTapeImage : blueRightImage;
            }
        }
    }, []);


    const handleBaseImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showStatus('Please select an image file', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setOriginalImageSize({ width: img.width, height: img.height });
                    showStatus('Image loaded successfully', 'success');
                };
                const dataUrl = e.target?.result as string;
                img.src = dataUrl;
                setBaseImage(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const showStatus = useCallback((message: string, type: 'error' | 'success') => {
        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
        }

        setStatus({ message, type });

        statusTimeoutRef.current = setTimeout(() => {
            setStatus(null);
        }, 1000);
    }, []);

    useEffect(() => {
        return () => {
            if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
            }
        };
    }, []);

    // Handle style mode changes - load correct default image
    useEffect(() => {
        if (styleMode === 'style1') {
            setCurrentHatImage(getHatImage(hatColor, isFlipped, hasTape));
        } else {
            // Style 2 - use the current selection with tape consideration
            const imageMap = hasTape ? {
                'orangeWhiteLogo': orangeHatWhiteLogoTapeImage,
                'orangeBlackLogo': orangeHatBlackLogoTapeImage,
                'blueWhiteLogo': blueHatWhiteLogoTapeImage,
                'blackOrangeLogo': blackHatOrangeLogoTapeImage,
            } : {
                'orangeWhiteLogo': orangeHatWhiteLogoImage,
                'orangeBlackLogo': orangeHatBlackLogoImage,
                'blueWhiteLogo': blueHatWhiteLogoImage,
                'blackOrangeLogo': blackHatOrangeLogoImage,
            };
            setCurrentHatImage(imageMap[style2Selection]);
        }
    }, [styleMode, hatColor, isFlipped, hasTape, style2Selection, getHatImage]);


    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 1) {
            isDragging.current = true;
            const touch = e.touches[0];
            dragStart.current = {
                x: touch.clientX - transform.position.x,
                y: touch.clientY - transform.position.y,
            };
        }
    }, [transform.position]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        if (isDragging.current && e.touches.length === 1) {
            const touch = e.touches[0];
            setTransform(prev => ({
                ...prev,
                position: {
                    x: touch.clientX - dragStart.current.x,
                    y: touch.clientY - dragStart.current.y,
                },
            }));
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        dragStart.current = {
            x: e.clientX - transform.position.x,
            y: e.clientY - transform.position.y,
        };
    }, [transform.position]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging.current) {
            setTransform(prev => ({
                ...prev,
                position: {
                    x: e.clientX - dragStart.current.x,
                    y: e.clientY - dragStart.current.y,
                },
            }));
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleRotate = useCallback((direction: 'left' | 'right') => {
        setTransform(prev => ({
            ...prev,
            rotation: prev.rotation + (direction === 'left' ? -15 : 15),
        }));
    }, []);

    const handleScale = useCallback((direction: 'up' | 'down') => {
        setTransform(prev => ({
            ...prev,
            scale: Math.max(0.1, Math.min(7, prev.scale * (direction === 'up' ? 1.1 : 0.9))),
        }));
    }, []);

    const handleFlip = useCallback(() => {
        setIsFlipped(prev => {
            const newFlipped = !prev;
            setCurrentHatImage(getHatImage(hatColor, newFlipped, hasTape));
            return newFlipped;
        });
    }, [hatColor, hasTape, getHatImage]);

    const handleTape = useCallback(() => {
        setHasTape(prev => {
            const newTape = !prev;
            setCurrentHatImage(getHatImage(hatColor, isFlipped, newTape));
            return newTape;
        });
    }, [hatColor, isFlipped, getHatImage]);

    const handleColorChange = useCallback((newColor: 'orange' | 'blue') => {
        setHatColor(newColor);
        setCurrentHatImage(getHatImage(newColor, isFlipped, hasTape));
    }, [isFlipped, hasTape, getHatImage]);

    const handleStyle2Selection = useCallback((selection: 'orangeWhiteLogo' | 'orangeBlackLogo' | 'blueWhiteLogo' | 'blackOrangeLogo') => {
        setStyle2Selection(selection);
        // Map selection to the correct image based on tape state
        const imageMap = hasTape ? {
            'orangeWhiteLogo': orangeHatWhiteLogoTapeImage,
            'orangeBlackLogo': orangeHatBlackLogoTapeImage,
            'blueWhiteLogo': blueHatWhiteLogoTapeImage,
            'blackOrangeLogo': blackHatOrangeLogoTapeImage,
        } : {
            'orangeWhiteLogo': orangeHatWhiteLogoImage,
            'orangeBlackLogo': orangeHatBlackLogoImage,
            'blueWhiteLogo': blueHatWhiteLogoImage,
            'blackOrangeLogo': blackHatOrangeLogoImage,
        };
        setCurrentHatImage(imageMap[selection]);
    }, [hasTape]);

    const handleReset = useCallback(() => {
        setTransform({
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: 1,
            flipX: false,
        });
        setHasTape(false);
        setIsFlipped(false);
        setCurrentHatImage(getHatImage(hatColor, false, false));
    }, [hatColor, getHatImage]);

    const handleSave = useCallback(async () => {
        if (!baseImage || !overlayRef.current || !containerRef.current) {
            showStatus('Please upload an image first', 'error');
            return;
        }

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            const baseImg = new Image();
            baseImg.src = baseImage;
            await new Promise(resolve => baseImg.onload = resolve);

            canvas.width = originalImageSize.width;
            canvas.height = originalImageSize.height;

            ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();
            const containerAspect = containerRect.width / containerRect.height;
            const imageAspect = canvas.width / canvas.height;

            let displayedWidth = containerRect.width;
            let displayedHeight = containerRect.height;
            if (containerAspect > imageAspect) {
                displayedWidth = displayedHeight * imageAspect;
            } else {
                displayedHeight = displayedWidth / imageAspect;
            }

            const scaleX = canvas.width / displayedWidth;
            const scaleY = canvas.height / displayedHeight;

            const overlayImg = overlayRef.current.querySelector('img');
            if (overlayImg) {
                const hatImg = new Image();
                hatImg.src = currentHatImage;
                await new Promise(resolve => hatImg.onload = resolve);

                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                ctx.save();
                ctx.translate(centerX + (transform.position.x * scaleX), centerY + (transform.position.y * scaleY));
                ctx.rotate((transform.rotation * Math.PI) / 180);
                if (transform.flipX) {
                    ctx.scale(-1, 1);
                }
                ctx.scale(transform.scale, transform.scale);

                // Get the ACTUAL hat size from the DOM instead of guessing breakpoints
                const actualHatRect = overlayImg.getBoundingClientRect();
                const actualHatWidth = actualHatRect.width;
                
                // Divide by transform.scale to get the unscaled size since getBoundingClientRect 
                // returns the already-scaled size, but we apply scaling again in canvas
                const unscaledHatWidth = actualHatWidth / transform.scale;
                
                const overlayWidth = unscaledHatWidth * scaleX;
                const overlayHeight = (overlayWidth * hatImg.height) / hatImg.width;
                ctx.drawImage(hatImg, -overlayWidth / 2, -overlayHeight / 2, overlayWidth, overlayHeight);

                ctx.restore();
            }

            const link = document.createElement('a');
            link.download = 'eliza-hat.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

            showStatus('Image saved successfully', 'success');
        } catch (error) {
            console.error('Save error:', error);
            showStatus('Error saving image', 'error');
        }
    }, [baseImage, transform, originalImageSize, currentHatImage]);

    const getOverlayStyle = () => {
        return {
            transform: `translate(-50%, -50%) 
                       translate(${transform.position.x}px, ${transform.position.y}px)
                       rotate(${transform.rotation}deg)
                       scale(${transform.scale * (transform.flipX ? -1 : 1)}, ${transform.scale})`,
        };
    };

    return (
        <div className="flex flex-col lg:flex-row w-full min-h-screen bg-[#0b35f1] text-white overflow-hidden">
            <div className="absolute top-4 left-4 lg:top-8 lg:left-8 z-20">
                <a 
                    href="https://elizaos.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-80 transition-opacity"
                >
                    <img 
                        src={elizaLogo} 
                        alt="elizaOS Logo" 
                        className="h-8 lg:h-12 w-auto"
                    />
                </a>
            </div>
            
            {/* Version indicator */}
            <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-20">
                <span className="text-xs text-white font-thin font-mono">v1.0</span>
            </div>
            
            {/* Mobile: Bottom Panel, Desktop: Left Panel - Controls */}
            <div className="order-2 lg:order-1 w-full lg:w-1/3 flex flex-col gap-2 lg:gap-6 p-4 lg:p-8 pt-4 lg:pt-24 overflow-y-auto flex-1 lg:flex-none lg:h-auto">
                <div className="text-center lg:text-left">
                    <h1 className="text-white text-xl lg:text-3xl tracking-wider font-neue-haas-display font-thin">
                        Put on your elizaOS hat
                    </h1>
                </div>

                <div className="w-full">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleBaseImageUpload}
                        className="w-full p-3 border-2 border-white rounded-lg bg-white/10 text-white cursor-pointer font-neue-haas-text font-normal transition-all hover:border-white hover:bg-white/20"
                    />
                </div>

                {/* Style Selector */}
                <div className="w-full">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStyleMode('style1')}
                            className={`flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all
                                ${styleMode === 'style1' 
                                    ? 'bg-white text-[#0b35f1] hover:bg-white/90' 
                                    : 'bg-white/20 text-white hover:bg-white/30'}`}
                        >
                            Style 1
                        </button>
                        <button
                            onClick={() => setStyleMode('style2')}
                            className={`flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all
                                ${styleMode === 'style2' 
                                    ? 'bg-white text-[#0b35f1] hover:bg-white/90' 
                                    : 'bg-white/20 text-white hover:bg-white/30'}`}
                        >
                            Style 2
                        </button>
                    </div>
                </div>

                {/* Color Selector - Style 1 */}
                {styleMode === 'style1' && (
                    <div className="w-full">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleColorChange('orange')}
                                    className={`flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all
                                        ${hatColor === 'orange' 
                                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                            : 'bg-white/20 text-white hover:bg-white/30'}`}
                                >
                                    🟠 Orange
                                </button>
                                <button
                                    onClick={() => handleColorChange('blue')}
                                    className={`flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all
                                        ${hatColor === 'blue' 
                                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                            : 'bg-white/20 text-white hover:bg-white/30'}`}
                                >
                                    🔵 Blue
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Color Selector - Style 2 */}
                {styleMode === 'style2' && (
                    <div className="w-full">
                        <div className="flex flex-col gap-2">
                            {/* Orange Row */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStyle2Selection('orangeWhiteLogo')}
                                    className={`flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all
                                        ${style2Selection === 'orangeWhiteLogo' 
                                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                            : 'bg-white/20 text-white hover:bg-white/30'}`}
                                >
                                    Orange Hat, White Logo
                                </button>
                                <button
                                    onClick={() => handleStyle2Selection('orangeBlackLogo')}
                                    className={`flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all
                                        ${style2Selection === 'orangeBlackLogo' 
                                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                            : 'bg-white/20 text-white hover:bg-white/30'}`}
                                >
                                    Orange Hat, Black Logo
                                </button>
                            </div>
                            {/* Blue and Black Row */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStyle2Selection('blueWhiteLogo')}
                                    className={`flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all
                                        ${style2Selection === 'blueWhiteLogo' 
                                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                            : 'bg-white/20 text-white hover:bg-white/30'}`}
                                >
                                    Blue Hat, White Logo
                                </button>
                                <button
                                    onClick={() => handleStyle2Selection('blackOrangeLogo')}
                                    className={`flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all
                                        ${style2Selection === 'blackOrangeLogo' 
                                            ? 'bg-black text-white hover:bg-gray-800' 
                                            : 'bg-white/20 text-white hover:bg-white/30'}`}
                                >
                                    Black Hat, Orange Logo
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2 lg:gap-3">
                    {/* Rotate buttons */}
                    <div className="flex gap-2 lg:gap-3">
                        <button
                            onClick={() => handleRotate('left')}
                            className="flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg bg-white text-[#0b35f1] cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                        >
                            ⟲ Rotate left
                        </button>
                        <button
                            onClick={() => handleRotate('right')}
                            className="flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg bg-white text-[#0b35f1] cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                        >
                            ⟳ Rotate right
                        </button>
                    </div>
                    
                    {/* Scale buttons */}
                    <div className="flex gap-2 lg:gap-3">
                        <button
                            onClick={() => handleScale('up')}
                            className="flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg bg-white text-[#0b35f1] cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                        >
                            ⊕ Scale up
                        </button>
                        <button
                            onClick={() => handleScale('down')}
                            className="flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg bg-white text-[#0b35f1] cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                        >
                            ⊖ Scale down
                        </button>
                    </div>
                    
                    {/* Flip and Tape buttons */}
                    <div className="flex gap-2 lg:gap-3">
                        <button
                            onClick={handleFlip}
                            disabled={styleMode === 'style2'}
                            className={`flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all
                                ${styleMode === 'style2' 
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50' 
                                    : 'bg-white text-[#0b35f1] cursor-pointer hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0'}`}
                        >
                            ↔️ Flip
                        </button>
                        <button
                            onClick={handleTape}
                            className="flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg bg-white text-[#0b35f1] cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                        >
                            🔧 Duct tape
                        </button>
                    </div>
                    
                    {/* Reset and Save buttons */}
                    <div className="flex gap-2 lg:gap-3">
                        <button
                            onClick={handleReset}
                            className="flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg bg-white text-[#0b35f1] cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!baseImage}
                            className="flex-1 px-3 py-2 lg:px-4 lg:py-3 rounded-lg bg-white text-[#0b35f1] cursor-pointer text-sm lg:text-base font-neue-haas-text font-normal tracking-wider transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Save image
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile: Top Panel, Desktop: Right Panel - Canvas */}
            <div className="order-1 lg:order-2 w-full lg:w-2/3 flex items-center justify-center p-4 lg:p-8 flex-1 lg:flex-none lg:h-auto pt-16 lg:pt-8">
                <div
                    ref={containerRef}
                    className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] max-w-[400px] lg:max-w-none lg:w-full border-2 lg:border-3 border-white rounded-xl overflow-hidden touch-none bg-[#2a2a2a] shadow-lg"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                >
                    {baseImage && (
                        <img src={baseImage} alt="Base" className="w-full h-full object-contain" />
                    )}

                    <div
                        ref={overlayRef}
                        style={getOverlayStyle()}
                        className="absolute top-1/2 left-1/2 cursor-move touch-none filter drop-shadow-lg"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img
                            src={currentHatImage}
                            alt="Overlay"
                            className="w-[200px] sm:w-[300px] md:w-[400px] h-auto select-none"
                            draggable={false}
                        />
                    </div>
                </div>
            </div>

            {status && (
                <div
                    className={`fixed bottom-20 right-8 px-6 py-3 rounded-lg 
                    ${status.type === 'error' ? 'bg-red-500' : 'bg-green-600'}
                    text-white font-medium shadow-lg
                    transition-opacity duration-300
                    opacity-90 animate-fade-out`}
                >
                    {status.message}
                </div>
            )}
        </div>
    );
};

export default PhotoEditor;