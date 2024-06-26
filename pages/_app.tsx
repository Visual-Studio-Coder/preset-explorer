import React from "react";
import Head from "next/head";
import clsx from "clsx";
import { Analytics } from "@vercel/analytics/react";
import "../styles/globals.css";

import { Inter, JetBrains_Mono } from "next/font/google";

import type { AppProps } from "next/app";
import {
  Toast,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../components/Toast";
import { useSectionInViewObserver } from "../utils/useSectionInViewObserver";

import styles from "../styles/Home.module.css";

import Link from "next/link";
import { ButtonGroup } from "../components/ButtonGroup";
import { Button } from "../components/Button";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  CopyClipboardIcon,
  DownloadIcon,
  LinkIcon,
  PlusCircleIcon,
  RaycastLogoNegIcon,
} from "@raycast/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/DropdownMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../components/Dialog";
import { useRouter } from "next/router";
import { Preset } from "../data/presets";
import {
  addToRaycast,
  copyData,
  downloadData,
  makeUrl,
} from "../utils/actions";
import copy from "copy-to-clipboard";
import { isTouchDevice } from "../utils/isTouchDevice";
import { TooltipProvider } from "../components/Tooltip";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

function MyApp({ Component, pageProps }: AppProps) {
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [isTouch, setIsTouch] = React.useState<boolean>();

  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [enableViewObserver, setEnableViewObserver] = React.useState(false);
  useSectionInViewObserver({ headerHeight: 72, enabled: enableViewObserver });

  const router = useRouter();
  const isOnPresetPage =
    router.pathname.includes("/shared") || router.pathname.includes("/preset");

  const preset: Preset | null = pageProps.preset;

  const handleDownload = React.useCallback(() => {
    if (!preset) return;
    downloadData(preset);
  }, [preset]);

  const handleCopyData = React.useCallback(() => {
    if (!preset) return;
    copyData(preset);
    setToastMessage("Copied to clipboard");
    setShowToast(true);
  }, [preset]);

  const handleCopyUrl = React.useCallback(async () => {
    if (!preset) return;
    setToastMessage("Copying URL to clipboard...");
    setShowToast(true);

    const url = makeUrl(preset);
    let urlToCopy = url;
    if (!preset.id) {
      const encodedUrl = encodeURIComponent(urlToCopy);
      const response = await fetch(
        `https://ray.so/api/shorten-url?url=${encodedUrl}&ref=presets`
      ).then((res) => res.json());

      if (response.link) {
        urlToCopy = response.link;
      }
    }

    copy(urlToCopy);
    setShowToast(true);
    setToastMessage("Copied URL to clipboard!");
  }, [preset]);

  const handleAddToRaycast = React.useCallback(() => {
    if (!preset) return;
    return addToRaycast(router, preset);
  }, [router, preset]);

  React.useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  React.useEffect(() => {
    if (showToast) {
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }
  }, [showToast]);

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const { key, keyCode, metaKey, shiftKey, altKey } = event;

      if (key === "k" && metaKey) {
        if (!preset) return;
        setActionsOpen((prevOpen) => {
          return !prevOpen;
        });
      }

      if (key === "d" && metaKey) {
        if (!preset) return;
        event.preventDefault();
        handleDownload();
      }

      if (key === "Enter" && metaKey) {
        if (!preset) return;
        event.preventDefault();
        handleAddToRaycast();
      }

      // key === "c" doesn't work when using alt key, so we use keCode instead (67)
      if (keyCode === 67 && metaKey && altKey) {
        if (!preset) return;
        event.preventDefault();
        handleCopyData();
        setActionsOpen(false);
      }

      if (key === "c" && metaKey && shiftKey) {
        if (!preset) return;
        event.preventDefault();
        handleCopyUrl();
        setActionsOpen(false);
      }

      if (key === "/" && metaKey) {
        event.preventDefault();
        setActionsOpen(false);
        setAboutOpen((prevOpen) => !prevOpen);
      }

      if (key === "a" && metaKey) {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [
    setActionsOpen,
    setAboutOpen,
    preset,
    handleCopyData,
    handleDownload,
    handleCopyUrl,
    handleAddToRaycast,
  ]);

  return (
    <>
      <Head>
        <link rel="icon" type="image/x-icon" href={`/favicon.png`} />
        <meta property="og:type" content="website" key="og-type" />
        <meta
          property="twitter:card"
          content="summary_large_image"
          key="twitter-card"
        />
        <meta property="twitter:site" content="@raycastapp" />
      </Head>
      <TooltipProvider delayDuration={0}>
        <ToastProvider swipeDirection="down">
          <style jsx global>{`
            :root {
              --font-inter: ${inter.style.fontFamily};
              --font-jetbrains: ${jetbrainsMono.style.fontFamily};
            }
          `}</style>
          <header className={styles.nav}>
            <div
              className={clsx(
                styles.logoContainer,
                isOnPresetPage && styles.isOffset
              )}
            >
              <Link
                href="/"
                aria-label="Home"
                className={clsx(
                  styles.backButton,
                  isOnPresetPage && styles.isVisible
                )}
                aria-disabled={!isOnPresetPage}
                tabIndex={isOnPresetPage ? 0 : -1}
              >
                <ChevronLeftIcon />
              </Link>
              <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
                <DialogTrigger asChild>
                  <button className={styles.logo}>
                    <span className={styles.logoIcon}>
                      <RaycastLogoNegIcon />
                    </span>
                    <h1>Preset Explorer</h1>
                  </button>
                </DialogTrigger>
                <DialogContent className={styles.about} showCloseButton={true}>
                  <div className={styles.aboutTopContent}>
                    <div>
                      <DialogTitle className={styles.dialogTitle}>
                        About
                      </DialogTitle>
                      <DialogDescription className={styles.dialogDescription}>
                        Preset Explorer is a tool to easily browse, share, and
                        add presets to <a href="https://raycast.com">Raycast</a>
                        .
                      </DialogDescription>
                      <p className={styles.dialogDescription}>
                        Open a preset and click the “Add to Raycast” button to
                        import the preset directly into Raycast. You can also
                        download the preset as a JSON file, or copy the URL to
                        share with others.
                      </p>
                    </div>
                    {!isTouch && (
                      <div>
                        <h4 className={styles.dialogTitle}>Shortcuts</h4>
                        <ul className={styles.shortcuts}>
                          <li>
                            Add to Raycast
                            <span className={styles.hotkeys}>
                              <kbd>⌘</kbd>
                              <kbd>⏎</kbd>
                            </span>
                          </li>
                          <li>
                            Toggle Export Menu
                            <span className={styles.hotkeys}>
                              <kbd>⌘</kbd>
                              <kbd>K</kbd>
                            </span>
                          </li>
                          <li>
                            Download JSON
                            <span className={styles.hotkeys}>
                              <kbd>⌘</kbd>
                              <kbd>D</kbd>
                            </span>
                          </li>
                          <li>
                            Copy JSON
                            <span className={styles.hotkeys}>
                              <kbd>⌘</kbd>
                              <kbd>⌥</kbd>
                              <kbd>C</kbd>
                            </span>
                          </li>
                          <li>
                            Copy URL to Share
                            <span className={styles.hotkeys}>
                              <kbd>⌘</kbd>
                              <kbd>⇧</kbd>
                              <kbd>C</kbd>
                            </span>
                          </li>
                          <li>
                            Toggle this view
                            <span className={styles.hotkeys}>
                              <kbd>⌘</kbd>
                              <kbd>/</kbd>
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <h4 className={styles.dialogTitle}>Contribute</h4>
                  <p className={styles.dialogDescription}>
                    This project is Open Source and{" "}
                    <a
                      href="https://github.com/raycast/preset-explorer"
                      title="Preset Explorer on GitHub"
                    >
                      available on GitHub
                    </a>
                    . We welcome contributions!
                    <br />
                    If you have any questions or feedback, please{" "}
                    <a href="mailto:feedback+rayso@raycast.com?subject=presets">
                      send us an email
                    </a>
                    .
                  </p>

                  <p style={{ fontSize: 13, marginTop: 32 }}>
                    <a
                      href="https://raycast.com?ref=presets"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      Made by{" "}
                      <span style={{ color: "#FF6363" }}>
                        <RaycastLogoNegIcon />{" "}
                      </span>
                      <span>Raycast</span>
                    </a>
                  </p>
                  <div className={styles.aboutGlow} />
                </DialogContent>
              </Dialog>
            </div>
            {isOnPresetPage && (
              <div className={styles.navControls}>
                <ButtonGroup>
                  <Button variant="red" onClick={() => handleAddToRaycast()}>
                    <PlusCircleIcon /> Add to Raycast
                  </Button>

                  <DropdownMenu
                    open={actionsOpen}
                    onOpenChange={setActionsOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="red" aria-label="Export options">
                        <ChevronDownIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => handleDownload()}>
                        <DownloadIcon /> Download JSON
                        <span className={styles.hotkeys}>
                          <kbd>⌘</kbd>
                          <kbd>D</kbd>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleCopyData()}>
                        <CopyClipboardIcon /> Copy JSON{" "}
                        <span className={styles.hotkeys}>
                          <kbd>⌘</kbd>
                          <kbd>⌥</kbd>
                          <kbd>C</kbd>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleCopyUrl()}>
                        <LinkIcon /> Copy URL to Share{" "}
                        <span className={styles.hotkeys}>
                          <kbd>⌘</kbd>
                          <kbd>⇧</kbd>
                          <kbd>C</kbd>
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ButtonGroup>
              </div>
            )}
          </header>
          <Component
            {...pageProps}
            onTouchReady={() => setEnableViewObserver(true)}
            showToast={showToast}
            setShowToast={setShowToast}
            setToastMessage={setToastMessage}
            toastMessage={toastMessage}
          />
          <Toast open={showToast} onOpenChange={setShowToast}>
            <ToastTitle>
              <CopyClipboardIcon /> {toastMessage}
            </ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      </TooltipProvider>
      <Analytics />
    </>
  );
}

export default MyApp;
