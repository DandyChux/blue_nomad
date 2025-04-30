'use client';

import { ViewportProvider } from '~/lib/useViewport';
import PlausibleProvider from 'next-plausible';

type ProviderProps = {
	children: React.ReactNode;
};

export const Providers: React.FC<ProviderProps> = ({ children }) => {
	return (
		<PlausibleProvider domain="bluenomadworld.com" customDomain="https://plausible.blackstacksolutions.com" selfHosted>
			<ViewportProvider>{children}</ViewportProvider>
		</PlausibleProvider>
	);
};
