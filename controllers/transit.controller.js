exports.getTransits = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Transits fetched successfully",
      data: [
        {
          "_id": "6850587a4a2dbd90589ad960",
          "title": "Sun Transit",
          "description": "Know the impact of Sun transit, expect great changes.",
          "image": "https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg",
          "slug": "sun-transit",
          "createdAt": "2025-06-16T17:46:34.049Z",
          "updatedAt": "2025-06-16T17:46:34.049Z",
          "__v": 0,
          "color": "FFD180"
        },
        {
          "_id": "6850587a4a2dbd90589ad961",
          "title": "Moon Transit",
          "description": "Moon transit affects emotions, mood swings and intuition.",
          "image": "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg",
          "slug": "moon-transit",
          "createdAt": "2025-06-16T17:46:35.000Z",
          "updatedAt": "2025-06-16T17:46:35.000Z",
          "__v": 0,
          "color": "F5F5F5"
        },
        {
          "_id": "6850587a4a2dbd90589ad962",
          "title": "Mars Transit",
          "description": "Mars transit brings energy, action, passion, and challenges.",
          "image": "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg",
          "slug": "mars-transit",
          "createdAt": "2025-06-16T17:46:36.000Z",
          "updatedAt": "2025-06-16T17:46:36.000Z",
          "__v": 0,
          "color": "FF8A80"
        },
        {
          "_id": "6850587a4a2dbd90589ad963",
          "title": "Mercury Transit",
          "description": "Mercury transit affects communication, travel, and decisions.",
          "image": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg",
          "slug": "mercury-transit",
          "createdAt": "2025-06-16T17:46:37.000Z",
          "updatedAt": "2025-06-16T17:46:37.000Z",
          "__v": 0,
          "color": "B9F6CA"
        },
        {
          "_id": "6850587a4a2dbd90589ad964",
          "title": "Jupiter Transit",
          "description": "Jupiter transit brings growth, expansion, luck, and wisdom.",
          "image": "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg",
          "slug": "jupiter-transit",
          "createdAt": "2025-06-16T17:46:38.000Z",
          "updatedAt": "2025-06-16T17:46:38.000Z",
          "__v": 0,
          "color": "FFFF8D"
        },
        {
          "_id": "6850587a4a2dbd90589ad965",
          "title": "Venus Transit",
          "description": "Venus transit influences love, beauty, comfort, and luxury.",
          "image": "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg",
          "slug": "venus-transit",
          "createdAt": "2025-06-16T17:46:39.000Z",
          "updatedAt": "2025-06-16T17:46:39.000Z",
          "__v": 0,
          "color": "FCE4EC"
        },
        {
          "_id": "6850587a4a2dbd90589ad966",
          "title": "Saturn Transit",
          "description": "Saturn transit teaches discipline, karma, hard work and patience.",
          "image": "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg",
          "slug": "saturn-transit",
          "createdAt": "2025-06-16T17:46:40.000Z",
          "updatedAt": "2025-06-16T17:46:40.000Z",
          "__v": 0,
          "color": "8C9EFF"
        },
        {
          "_id": "6850587a4a2dbd90589ad967",
          "title": "Rahu Transit",
          "description": "Rahu transit brings unexpected events, illusions, and ambitions.",
          "image": "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg",
          "slug": "rahu-transit",
          "createdAt": "2025-06-16T17:46:41.000Z",
          "updatedAt": "2025-06-16T17:46:41.000Z",
          "__v": 0,
          "color": "CFD8DC"
        },
        {
          "_id": "6850587a4a2dbd90589ad968",
          "title": "Ketu Transit",
          "description": "Ketu transit supports spirituality, detachment, and past-life karmas.",
          "image": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg",
          "slug": "ketu-transit",
          "createdAt": "2025-06-16T17:46:42.000Z",
          "updatedAt": "2025-06-16T17:46:42.000Z",
          "__v": 0,
          "color": "D7CCC8"
        }
      ]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};
