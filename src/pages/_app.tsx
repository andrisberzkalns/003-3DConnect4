import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>3D Connect 4</title>
        <meta
          name="description"
          content="Play 3D Connect 4 game online for free. No download required."
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Toaster position="top-center" />
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
