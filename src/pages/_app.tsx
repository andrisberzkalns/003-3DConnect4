import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { SettingsProvider } from "~/contexts/settingsContext";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <SettingsProvider>
        <Head>
          <title>3D Connect 4</title>
          <meta
            name="description"
            content="Play 3D Connect 4 game online for free. No download required."
          />
          <link rel="icon" href="/favicon.png" />
          <meta
            name="google-site-verification"
            content="ZwyUoEn3ASeRvukRC3UJ-eRPoJ_Yy2y1xsy3hHf0AQI"
          />
        </Head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-1D3S5SCDB0`}
        />
        <Script
          id="gtag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-1D3S5SCDB0');
            `,
          }}
        />
        <Toaster position="top-center" />
        <Component {...pageProps} />
      </SettingsProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
