"use client";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import Image from "next/image";
import { FaBell, FaChartLine, FaGoogle, FaHome } from "react-icons/fa"; // Importing the notification icon
import { useGlobalContext } from "@/context/GlobalContext";
import { MoonLoader } from "react-spinners";

const NavItems = () => {
  const { data: session , status } = useSession();
  const [providers, setProviders] = useState();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileImage = session?.user?.image;
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const { notificationCount, setNotificationCount } = useGlobalContext();
  const [fetchingProfile , setFetchingProfile] = useState(true)

  useEffect(() => {
    const setAuthProviders = async () => {
      if (!session) {
        // Check if session is falsy before fetching providers
        try {
          const res = await getProviders();
          setProviders(res);
        } catch (error) {
          console.log(error);
        }
      }
    };

    const fetchUnreadCount = async () => {
      if (!session || !session?.user || !session?.user?.id) {
        return;
      }
      const id = session?.user?.id;
      try {
        const response = await fetch("/api/notifications/unread-count", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });
        const data = await response.json();
        if (data.ok) {
          setNotificationCount(data.count);
        }
      } catch (error) {
        console.log(error);
      }
    };

    setAuthProviders();
    fetchUnreadCount();
  }, [session]);

  useEffect(() => {
    if (status === 'loading') {
      setFetchingProfile(true);
    } else {
      setFetchingProfile(false);
    }
  }, [status]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <div className="flex items-center space-x-4 md:space-x-7">
      <Link href="/" title="Home">
        <FaHome className="text-2xl  text-gray-700" />
      </Link>

      {/* Notification Icon */}
      {session && (
        <Link href="/notifications" title="Notifications">
          {" "}
          {/* Add proper href for notifications */}
          <div className="relative">
            <FaBell className="text-gray-700 text-2xl" />
            {notificationCount > 0 && (
              <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs absolute -top-1 -right-1">
                {notificationCount}
              </span>
            )}
          </div>
        </Link>
      )}

      <Link href="/graphs" title="View Performance Graphs">
        <div className="relative">
          <FaChartLine className="text-2xl mr-2 text-gray-700" />
        </div>
      </Link>

      {!session && (fetchingProfile ? <MoonLoader size={24} color="#3b82f6"/> : (
        <>
          {Object.keys(providers || {}).length > 0 ? (
            Object.values(providers).map((provider, index) => (
              <button
                className="bg-gray-100 px-3 text-blue-700 rounded-xl py-1 border-[3px] hover:border-blue-500 hover:text-blue-900 flex items-center"
                key={index}
                onClick={() => {
                  signIn(provider.id);
                }}
              >
                <FaGoogle className="mr-2" />
                Sign In
              </button>
            ))
          ) : (
            <button
              className="bg-gray-100 px-3 text-gray-500 rounded-xl py-1 border-[3px] border-gray-300 flex items-center cursor-not-allowed"
              disabled
            >
              <FaGoogle className="mr-2" />
              Sign In
            </button>
          )}
        </>
      ))}

      {session && (
        <div>
          <div className="relative">
            <button
              type="button"
              className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              id="user-menu-button"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              ref={menuButtonRef}
            >
              <span className="absolute -inset-1.5"></span>
              <span className="sr-only">Open user menu</span>
              <Image
                className="h-8 w-8 rounded-full"
                src={profileImage || "/path/to/default/profile/image"} // Use your default profile image path
                alt=""
                width={40}
                height={40}
              />
            </button>

            {isProfileMenuOpen && (
              <div
                id="user-menu"
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-100 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabIndex="-1"
                ref={menuRef}
              >
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700"
                  role="menuitem"
                  tabIndex="-1"
                  id="user-menu-item-0"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                  }}
                >
                  Your Profile
                </Link>
                {session.codeforcesId && (
                  <Link
                    href={`/contest/with/${session?.codeforcesId}`}
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    tabIndex="-1"
                    id="user-menu-item-1"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    Contests
                  </Link>
                )}
                {session.codeforcesId && (
                  <Link
                    href={`/add-team`}
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    tabIndex="-1"
                    id="user-menu-item-1"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    Add Team
                  </Link>
                )}
                <Link
                  href={`/feedback`}
                  className="block px-4 py-2 text-sm text-gray-700"
                  role="menuitem"
                  tabIndex="-1"
                  id="user-menu-item-1"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                  }}
                >
                  Feedback
                </Link>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    signOut();
                  }}
                  className="block px-4 py-2 text-sm text-gray-700"
                  role="menuitem"
                  tabIndex="-1"
                  id="user-menu-item-2"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavItems;
