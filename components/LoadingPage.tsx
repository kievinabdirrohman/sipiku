import { motion } from "framer-motion";
import { useState, useEffect, useCallback, memo } from "react";

interface LoadingPageProps {
    isDoneLoading?: boolean;
    onLoadingComplete?: () => void;
    message?: string;
}

const LoadingPage = memo(({
    isDoneLoading = false,
    onLoadingComplete,
    message = "Loading",
}: LoadingPageProps) => {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [exitComplete, setExitComplete] = useState(false);

    const handleProgressIncrement = useCallback(() => {
        setLoadingProgress((prev) => {
            // Slow down progress as it approaches 90%
            const increment = prev < 30 ? 2 : prev < 60 ? 1 : prev < 90 ? 0.5 : 0;
            const newProgress = Math.min(90, prev + increment);
            return newProgress;
        });
    }, []);

    const handleLoadingComplete = useCallback(() => {
        setExitComplete(true);
        if (onLoadingComplete) onLoadingComplete();
    }, [onLoadingComplete]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (!isDoneLoading) {
            interval = setInterval(handleProgressIncrement, 100);
        } else {
            // Jump to 100% when isDoneLoading is true
            setLoadingProgress(100);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isDoneLoading, handleProgressIncrement]);

    useEffect(() => {
        if (loadingProgress === 100) {
            const timer = setTimeout(handleLoadingComplete, 1000);
            return () => clearTimeout(timer);
        }
    }, [loadingProgress, handleLoadingComplete]);

    if (exitComplete) return null;

    return (
        <motion.div
            className="loading-container"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
        >
            <div className="flex flex-col items-center justify-center space-y-8 px-4">
                <SpinnerAnimation />

                <LoadingInfo
                    message={message}
                    loadingProgress={loadingProgress}
                />
            </div>
        </motion.div>
    );
});

// Extracted components to prevent unnecessary re-renders
const SpinnerAnimation = memo(() => (
    <motion.div
        className="w-16 h-16 relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
        }}
    >
        <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-primary"
            animate={{ rotate: 360 }}
            transition={{
                duration: 1.2,
                ease: "linear",
                repeat: Infinity,
            }}
        />
        <motion.div
            className="absolute inset-3 rounded-full border-t-2 border-primary/70"
            animate={{ rotate: -360 }}
            transition={{
                duration: 1.8,
                ease: "linear",
                repeat: Infinity,
            }}
        />
    </motion.div>
));

SpinnerAnimation.displayName = 'SpinnerAnimation';

interface LoadingInfoProps {
    message: string;
    loadingProgress: number;
}

const LoadingInfo = memo(({ message, loadingProgress }: LoadingInfoProps) => (
    <div className="flex flex-col items-center space-y-4 max-w-xs">
        <motion.p
            className="text-primary text-lg font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
            {message}
        </motion.p>

        <div className="w-full max-w-md relative h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
                className="absolute left-0 top-0 bottom-0 bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut"
                }}
            />
        </div>

        <motion.p
            className="text-muted-foreground text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
        >
            {Math.round(loadingProgress)}%
        </motion.p>
    </div>
));

LoadingInfo.displayName = 'LoadingInfo';

LoadingPage.displayName = 'LoadingPage';

export default LoadingPage;