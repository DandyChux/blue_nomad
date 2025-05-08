'use client';

import { ViewportProvider } from '~/lib/useViewport';
import PlausibleProvider from 'next-plausible';
import { SearchProvider } from '~/lib/contexts/search-context';

type ProviderProps = {
	children: React.ReactNode;
};

export const Providers: React.FC<ProviderProps> = ({ children }) => {
	return (
		<PlausibleProvider domain="bluenomadworld.com" customDomain="https://plausible.blackstacksolutions.com" selfHosted>
			<ViewportProvider>
				<SearchProvider>
					{children}
				</SearchProvider>
			</ViewportProvider>
		</PlausibleProvider>
	);
};
