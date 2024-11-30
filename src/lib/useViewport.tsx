'use client';

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	type PropsWithChildren,
} from 'react';

interface IViewportContext {
	width: number;
	height: number;
}

const viewportContext = createContext({} as IViewportContext);

export const ViewportProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [windowSize, setWindowSize] = useState<IViewportContext>({
		width: 0,
		height: 0,
	});

	useEffect(() => {
		const handleWindowResize = (): void => {
			// Set window height/width to state
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
		handleWindowResize();

		window.addEventListener('resize', handleWindowResize);

		return () => window.removeEventListener('resize', handleWindowResize);
	}, []);

	return (
		<viewportContext.Provider value={windowSize}>
			{children}
		</viewportContext.Provider>
	);
};

export const useViewport = () => {
	const { width, height } = useContext(viewportContext);
	return { width, height };
};
