import { extendTheme } from "@chakra-ui/react"
import "@fontsource/bitter"
import "@fontsource/open-sans"

const theme = extendTheme({
    fonts: {
        heading: "Bitter",
        body: "Open Sans",
    },
})

export default theme