const FollowAstrologer = require("../models/FollowAstrologer");
const User = require("../models/UserDetail");
const Astrologer = require("../models/astroModel");


exports.followUnfollowAstrologer = async (req, res) => {
  try {
    const { userId, astrologerId } = req.body;

    if (!userId || !astrologerId) {
      return res.status(400).json({
        success: false,
        message: "userId & astrologerId are required"
      });
    }

    const user = await User.findById(userId);
    const astro = await Astrologer.findById(astrologerId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!astro) return res.status(404).json({ message: "Astrologer not found" });

    // Check if user already followed
    const alreadyFollowing = user.following.includes(astrologerId);

    if (!alreadyFollowing) {
      // FOLLOW
      user.following.push(astrologerId);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Astrologer followed successfully",
        following: user.following
      });
    } else {
      // UNFOLLOW
      user.following = user.following.filter(
        id => id.toString() !== astrologerId
      );
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Astrologer unfollowed successfully",
        following: user.following
      });
    }

  } catch (error) {
    console.error("Follow/Unfollow Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


