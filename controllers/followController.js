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

    // Check if user & astrologer exist
    const user = await User.findById(userId);
    const astro = await Astrologer.findById(astrologerId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!astro) return res.status(404).json({ message: "Astrologer not found" });

    // Check existing follow entry
    let followEntry = await FollowAstrologer.findOne({ userId, astrologerId });

    // FIRST HIT → FOLLOW
    if (!followEntry) {
      followEntry = await FollowAstrologer.create({
        userId,
        astrologerId,
        isFollowed: true
      });

      // 🔥 ADD astrologerId to user's following[]
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { following: astrologerId } }
      );

      return res.status(200).json({
        success: true,
        message: "Astrologer followed successfully",
        data: followEntry
      });
    }

    // SECOND HIT → TOGGLE FOLLOW / UNFOLLOW
    followEntry.isFollowed = !followEntry.isFollowed;
    await followEntry.save();

    if (followEntry.isFollowed) {
      // FOLLOW AGAIN
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { following: astrologerId } }
      );
    } else {
      // UNFOLLOW
      await User.findByIdAndUpdate(
        userId,
        { $pull: { following: astrologerId } }
      );
    }

    return res.status(200).json({
      success: true,
      message: followEntry.isFollowed
        ? "Astrologer followed again"
        : "Astrologer unfollowed",
      data: followEntry
    });

  } catch (error) {
    console.error("Follow/Unfollow Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

