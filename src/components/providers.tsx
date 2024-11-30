'use client';

import { ViewportProvider } from '~/lib/useViewport';

type ProviderProps = {
	children: React.ReactNode;
};

export const Providers: React.FC<ProviderProps> = ({ children }) => {
	return <ViewportProvider>{children}</ViewportProvider>;
};
