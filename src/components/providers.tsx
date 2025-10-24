'use client';

import { ViewportProvider } from '~/lib/useViewport';
import { SearchProvider } from '~/lib/contexts/search-context';

type ProviderProps = {
	children: React.ReactNode;
};

export const Providers: React.FC<ProviderProps> = ({ children }) => {
	return (
		<ViewportProvider>
			{children}
		</ViewportProvider>
	);
};
