import { extendTheme } from "@chakra-ui/react"
import "@fontsource/ibm-plex-serif"
import "@fontsource/ibm-plex-sans"

const theme = extendTheme({
    fonts: {
        heading: "IBM Plex Serif",
        body: "IBM Plex Sans",
    },
})

export default theme