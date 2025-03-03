## Backgrounds

### Add another provider

-   File structure is "provider/images,videos/user.ts"
-   Providers user function names should look like: providerImagesUser() or providerVideosUser()
-   Add endpoints in `backgrounds.ts`, path is a reversed file structure: "user/images,videos/provider"
-   If provider handles collections & tags, control for both inside the user function

### Available endpoints

-   backgrounds/daylight/store
-   backgrounds/daylight/images
-   backgrounds/daylight/videos
-   backgrounds/user/images/unsplash/?tags=
-   backgrounds/user/images/unsplash/?collections=
-   backgrounds/user/images/pixabay/?tags=
-   backgrounds/user/videos/pixabay/?tags=
