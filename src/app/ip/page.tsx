"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

type NetworkInfo = {
  ipv4?: string;
  ipv6?: string;
  city?: string;
  region?: string;
  country?: string;
  country_name?: string;
  postal?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
};

const Page = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch geo information (city, region, coordinates, etc.)
      const geoRes = await fetch("https://ipapi.co/json/");
      if (!geoRes.ok) {
        throw new Error("Failed to fetch geo info");
      }
      const geoData = await geoRes.json();

      // Fetch IPv4 address from ipify
      const ipv4Res = await fetch("https://api.ipify.org?format=json");
      let ipv4Data = {};
      if (ipv4Res.ok) {
        ipv4Data = await ipv4Res.json();
      }

      // Fetch IPv6 address from ipify
      const ipv6Res = await fetch("https://api64.ipify.org?format=json");
      let ipv6Data = {};
      if (ipv6Res.ok) {
        ipv6Data = await ipv6Res.json();
      }

      setNetworkInfo({
        ...geoData,
        ipv4: (ipv4Data as { ip?: string }).ip,
        ipv6: (ipv6Data as { ip?: string }).ip,
      });
    } catch (err) {
      console.error(err);
      setError("Unable to fetch network information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkInfo();
  }, []);

  // Construct a static map URL (non-interactive, fixed zoom level)
  let mapUrl = "";
  if (networkInfo && networkInfo.latitude && networkInfo.longitude) {
    // Using OpenStreetMap's static map API with a higher zoom level and larger size
    mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${networkInfo.latitude},${networkInfo.longitude}&zoom=13&size=800x400&markers=${networkInfo.latitude},${networkInfo.longitude},lightblue`;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white h-full">
      <div className="w-full max-w-5xl">
        <div className="relative border border-gray-300 p-6 rounded-lg bg-white shadow">
          <h1 className="absolute -top-3 left-4 bg-white px-2 text-lg font-mono">
            Network Info
          </h1>
          <div className="flex justify-end mb-4">
            <button
              onClick={fetchNetworkInfo}
              className="px-4 py-2 rounded font-mono bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : networkInfo ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* IPv4 Address */}
                <div className="p-2 bg-gray-50 border rounded">
                  <h2 className="text-sm font-bold text-gray-700">IPv4</h2>
                  <p className="text-gray-600">{networkInfo.ipv4}</p>
                </div>
                {/* IPv6 Address */}
                <div className="p-2 bg-gray-50 border rounded">
                  <h2 className="text-sm font-bold text-gray-700">IPv6</h2>
                  <p className="text-gray-600">{networkInfo.ipv6}</p>
                </div>
                {/* City */}
                <div className="p-2 bg-gray-50 border rounded">
                  <h2 className="text-sm font-bold text-gray-700">City</h2>
                  <p className="text-gray-600">{networkInfo.city}</p>
                </div>
                {/* Region */}
                <div className="p-2 bg-gray-50 border rounded">
                  <h2 className="text-sm font-bold text-gray-700">Region</h2>
                  <p className="text-gray-600">{networkInfo.region}</p>
                </div>
                {/* Country */}
                <div className="p-2 bg-gray-50 border rounded">
                  <h2 className="text-sm font-bold text-gray-700">Country</h2>
                  <p className="text-gray-600">
                    {networkInfo.country_name || networkInfo.country}
                  </p>
                </div>
                {/* Postal Code */}
                <div className="p-2 bg-gray-50 border rounded">
                  <h2 className="text-sm font-bold text-gray-700">
                    Postal Code
                  </h2>
                  <p className="text-gray-600">{networkInfo.postal}</p>
                </div>
                {/* Timezone */}
                <div className="p-2 bg-gray-50 border rounded">
                  <h2 className="text-sm font-bold text-gray-700">Timezone</h2>
                  <p className="text-gray-600">{networkInfo.timezone}</p>
                </div>
                {/* Coordinates */}
                <div className="p-2 bg-gray-50 border rounded">
                  <h2 className="text-sm font-bold text-gray-700">
                    Coordinates
                  </h2>
                  <p className="text-gray-600">
                    {networkInfo.latitude}, {networkInfo.longitude}
                  </p>
                </div>
              </div>
              {/* Map Snippet */}
              {networkInfo.latitude && networkInfo.longitude && (
                <div className="relative mt-6 col-span-2">
                  <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                    <img
                      src={mapUrl}
                      alt="Location Map"
                      className="w-full h-[300px] object-cover"
                    />
                    {/* Static Circle Marker Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-4 h-4 border-4 border-blue-500 rounded-full bg-blue-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <p className="mt-4 text-center text-xs text-gray-500 font-mono">
                Thank You{" "}
                <Link
                  href="https://ipify.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  ipify.org
                </Link>
                ,{" "}
                <Link
                  href="https://ipapi.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  ipapi.co
                </Link>{" "}
                and{" "}
                <Link
                  href="https://openstreetmap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  openstreetmap.org
                </Link>{" "}
                ❤️
              </p>
            </>
          ) : (
            <p className="text-center text-gray-600">
              No network information available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
