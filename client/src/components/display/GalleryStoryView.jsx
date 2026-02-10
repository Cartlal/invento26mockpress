import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { socket } from "../../socket";
import { serverUrl as SERVER_URL } from "../../config";

function GalleryStoryView({ eventState }) {
    const [currentImage, setCurrentImage] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (eventState?.currentGalleryImageId) {
            // Handle both populated object and raw ID (though server should populate)
            if (typeof eventState.currentGalleryImageId === 'object') {
                setCurrentImage(eventState.currentGalleryImageId);
                setProgress(0);
            }
        }
    }, [eventState]);

    useEffect(() => {
        socket.on('stateUpdate', (newState) => {
            console.log("🎨 GalleryView: State Update Received", newState.currentGalleryImageId ? "Image Data Present" : "No Image");
            if (newState.currentGalleryImageId && typeof newState.currentGalleryImageId === 'object') {
                setCurrentImage(newState.currentGalleryImageId);
                setProgress(0);
            }
        });

        return () => {
            socket.off('stateUpdate');
        };
    }, []);

    // Auto-progress bar (optional)
    useEffect(() => {
        if (!currentImage) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 0.5; // Progress every 50ms
            });
        }, 50);

        return () => clearInterval(interval);
    }, [currentImage]);

    if (!currentImage || typeof currentImage !== 'object' || !currentImage.imagePath) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-black">
                <p className="font-mono-tech text-spy-green text-sm tracking-widest animate-pulse">
                    LOADING CONTENT PROTOCOL...
                </p>
            </div>
        );
    }

    const imageSrc = currentImage.imagePath.startsWith('http')
        ? currentImage.imagePath
        : `${SERVER_URL}/images_char/${currentImage.imagePath}`;

    return (
        <div className="h-full w-full bg-black relative overflow-hidden flex items-center justify-center">
            {/* Progress Bar (like Instagram Stories) */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex gap-1">
                {/* You can add multiple progress bars here if showing multiple images */}
                <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Image Container */}
            <div className="w-full h-full flex items-center justify-center p-4">
                <img
                    src={imageSrc}
                    alt="Gallery"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    style={{
                        maxHeight: '90vh',
                        width: 'auto',
                        height: 'auto'
                    }}
                />
            </div>

            {/* Caption Overlay */}
            {currentImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="font-rajdhani text-white text-lg text-center">
                        {currentImage.caption}
                    </p>
                </div>
            )}

            {/* Tap Areas for Navigation (Instagram-style) */}
            <div className="absolute inset-0 flex">
                <div className="w-1/3 h-full flex items-center justify-start p-4">
                    <ChevronLeft className="w-10 h-10 text-white/50 hover:text-white cursor-pointer" />
                </div>
                <div className="w-1/3 h-full" />
                <div className="w-1/3 h-full flex items-center justify-end p-4">
                    <ChevronRight className="w-10 h-10 text-white/50 hover:text-white cursor-pointer" />
                </div>
            </div>

            {/* Close Button */}
            <button className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 border border-white/30 flex items-center justify-center hover:bg-black/70 transition-all">
                <X className="w-6 h-6 text-white" />
            </button>
        </div>
    );
}

export default GalleryStoryView;
