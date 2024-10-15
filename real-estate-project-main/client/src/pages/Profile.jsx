import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { app } from "../firebase";
import { RiImageEditFill } from "react-icons/ri";

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import toast from "react-hot-toast";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from "../redux/user/userSlice";

const Profile = () => {
  const fileRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0); // State to track file upload percentage
  const { loading, currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress)); // Update progress percentage
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        dispatch(updateUserFailure(data.message));
        toast.error(data.message || "Update failed. Please try again.");
        return;
      }

      dispatch(updateUserSuccess(data));
      toast.success("Update  successful!");
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
        toast.error(data.message || "Delete failed. Please try again.");

        return;
      }
      dispatch(deleteUserSuccess(data));
      toast.success("Delete user successful!");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        toast.error(data.message || "Sign out failed. Please try again.");

        return;
      }
      dispatch(deleteUserSuccess(data));
      toast.success("Sign out successful!");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileRef}
          onChange={(e) => setFile(e.target.files[0])}
          hidden
          accept="image/*"
        />
        {/* Profile Image */}
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />

        {/* Show Progress Bar when filePerc is between 0 and 100 */}
        {file && filePerc > 0 && filePerc < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${filePerc}%` }} // Set width of the progress bar
            />
          </div>
        )}

        {/* Submit Image Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className={`bg-blue-400 flex justify-center items-center gap-2 text-white p-3 rounded-lg mt-2 ${
            filePerc !== 100
              ? "opacity-50 cursor-not-allowed"
              : "hover:opacity-95"
          }`}
          disabled={filePerc !== 100} // Disable the button if filePerc is not 100
        >
          <RiImageEditFill className="text-xl" /> Image
        </button>

        {/* Username, Email, and Password Inputs */}
        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
          id="username"
          required
          className="border p-3 bg-slate-50 rounded-lg border-1 border-blue-400 outline-none"
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          required
          defaultValue={currentUser.email}
          onChange={handleChange}
          className="border p-3 bg-slate-50 rounded-lg border-1 border-blue-400 outline-none"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          defaultValue={currentUser.password}
          onChange={handleChange}
          className="border p-3 bg-slate-50 rounded-lg border-1 border-blue-400 outline-none"
        />

        {/* Update Button */}
        <button
          disabled={loading}
          className="bg-blue-400 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </form>

      {/* Delete and Sign Out Options */}
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-600 hover:underline cursor-pointer"
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className="text-red-600 hover:underline cursor-pointer">
          Sign out
        </span>
      </div>
    </div>
  );
};

export default Profile;
