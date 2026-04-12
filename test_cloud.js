const { extractPublicId } = require('./utils/cloudinaryHelper');

const testUrls = [
  "https://res.cloudinary.com/drld3ylyu/image/upload/v1712860882/korean-ecommerce/banners/middle_banner_3.webp",
  "http://res.cloudinary.com/ds5zzndma/image/upload/v1712918855/banners/qmwylr0qzzk5z6xj8pzh.png",
  "https://res.cloudinary.com/ds5zzndma/image/upload/v1712918855/banners/v233/xyz.jpg"
];

for (const url of testUrls) {
  console.log(url, "=>", extractPublicId(url));
}
