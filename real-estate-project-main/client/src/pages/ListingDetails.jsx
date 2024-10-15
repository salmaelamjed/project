import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import Contact from "../components/Contact";

const ListingDetails = () => {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${id}`);
        const data = await res.json();
        if (!res.ok) {
          console.log(data.message);
          toast.error("Failed to show listing details!");
          return;
        }
        setListing(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error("An error occurred!");
      }
    };

    fetchListing();
  }, [id]);


  

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {listing && !loading && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Share Button */}
          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}

          {/* Listing Details */}
          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <p className="text-2xl font-semibold">
              {listing.name} - ${" "}
              {listing.offer
                ? listing.discountPrice.toLocaleString("en-US")
                : listing.regularPrice.toLocaleString("en-US")}
              {listing.type === "rent" && " / month"}
            </p>

            {/* Location */}
            <p className="flex items-center mt-6 gap-2 text-slate-700  text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>

            {/* Listing Type and Discount */}
            <div className="flex gap-4">
              <p className="bg-blue-400 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </p>
              {listing.offer && (
                <p className="bg-green-700 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  ${+listing.regularPrice - +listing.discountPrice} discount
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-700">
              <span className="font-semibold text-black">Description - </span>
              {listing.description}
            </p>

            {/* Listing Info */}
            <ul className="text-green-700 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} beds `
                  : `${listing.bedrooms} bed `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} baths `
                  : `${listing.bathrooms} bath `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaParking className="text-lg" />
                {listing.parking ? "Parking spot" : "No Parking"}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaChair className="text-lg" />
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </li>
            </ul>

            {/* Contact Info */}
            <div className="mt-4 bg-slate-100 p-4 rounded-lg">
              <p className="text-lg font-semibold">Contact Information</p>
              <p className="text">Email: {listing.email}</p>
              <p className="text">Phone: {listing.phoneNumber}</p>
            </div>

          
            {/* Contact Button */}
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className="bg-blue-400 text-white rounded-lg uppercase hover:opacity-95 p-3 mt-4"
              >
                Contact landlord
              </button>
            )}

            {/* Contact Form */}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
};

export default ListingDetails;
