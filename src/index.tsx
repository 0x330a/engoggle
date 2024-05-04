import {serveStatic} from '@hono/node-server/serve-static'
import {Button, Frog} from 'frog'
import { serve } from '@hono/node-server'
import {createSystem} from "frog/ui";
import axios from "axios";
import {pinata} from "frog/hubs";

const { Image, Text, Box, Columns, Column, vars } = createSystem();

export const app = new Frog({
  ui: { vars },
  hub: pinata(),
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

app.use('/*', serveStatic({ root: './public' }))

app.frame('/', async (c) => {
  const query = c.req.query("fid")
  const { frameData, buttonValue } = c;
  const actor = frameData?.fid;
  const op = frameData?.fid ?? query ?? frameData?.castId?.fid;
  const myUrl = `https://warpcast.com/~/compose?test=peep%20my%20nounish%20pfp&embeds[]=https://noggles.mempool.online?fid=${actor}`;
  const url = `https://nog.mempool.online/face/${op}`;
  let hasImage = false;
  try {
      const res = await axios.get(url);
      if (res.status === 200) {
          hasImage = true;
      }
  } catch (e) {
      hasImage = false;
  }

  const reset = <Button.Reset>Reset</Button.Reset>;

  const intents = buttonValue !== "mine" ? [
    <Button value="mine">Show me mine!</Button>
  ] : hasImage ? [<Button.Link href={myUrl}>Share!</Button.Link>,reset] : [reset];
    return c.res({
        image: (
            <Box grow background="background200">
                <Columns gap="8" alignVertical={"center"} grow>
                    <Column width="1/2" alignHorizontal={"center"} alignVertical={"center"} padding={"20"}>
                        <Image src={hasImage ? url : "/red.png"} width={"256"} height={"256"}/>
                    </Column>
                    <Column width="1/2" alignHorizontal={"center"} alignVertical={"center"} padding={"20"}>
                        <Text color="text200" size="20">
                            { hasImage ? "Here's my nounish Farcaster PFP, share to see what yours would look like!" :
                                "Couldn't generate a nounish PFP with the current Farcaster PFP, try a different one!"
                            }
                        </Text>
                    </Column>
                </Columns>
            </Box>
        ),
        intents
    })
})

//devtools(app, { serveStatic })

serve({
  fetch: app.fetch,
  port: 3000,
})
