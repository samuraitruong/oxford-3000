import "./App.css";
import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CampaignIcon from "@mui/icons-material/Campaign";

import {
  Container,
  Slider,
  Typography,
  Grid,
  List,
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

function App() {
  const [level, setLevel] = useState(6);

  const [started, setStarted] = useState(false);
  const [total, setTotal] = useState(20);
  const [delay, setDelay] = useState(15);
  const [word, setWord] = useState();
  const [data, setData] = useState(undefined);
  const [playedWords, setPlayedWord] = useState([]);

  useEffect(() => {
    console.log("Use Effect");
    if (!data) {
      fetch(
        "https://raw.githubusercontent.com/samuraitruong/oxford-3000/master/data/oxford-5000.json"
      )
        .then((x) => x.json())
        .then((t) => {
          const wordsFilters = t.filter((x) => x.word.length <= level);
          setData(wordsFilters);
        });
    }
    console.log("started me", started, playedWords);
    if (started) {
      const playSound = (sound) => {
        new Audio(
          `https://raw.githubusercontent.com/samuraitruong/oxford-3000/master/data/media/${sound}`
        ).play();
      };
      console.log("play word");
      const playWord = () => {
        const index = Math.floor(Math.random() * data.length);
        const newWord = data[index];
        const sounds = [...newWord.sound.uk, ...newWord.sound.us].map((x) =>
          x.split("/").pop()
        );
        setWord(newWord);
        setTimeout(() => {
          console.log(playedWords, total);
          const list = [...playedWords, newWord];
          if (list.length > total) {
            setStarted(false);
          }

          setPlayedWord(list);
        }, delay * 1000);

        for (let i = 0; i < sounds.length; i++) {
          setTimeout(
            () => playSound(sounds[i]),
            (delay / sounds.length) * i * 1000
          );
        }
      };
      playWord();
    }
  }, [data, level, started, playedWords, delay, total]);

  return (
    <Container maxWidth="sm" xs={{ mt: 5 }}>
      <Grid container>
        <Grid xs={9} item>
          <Slider
            disabled={started}
            marks
            min={2}
            max={10}
            value={level}
            defaultValue={5}
            valueLabelFormat={(x) => x.toString()}
            aria-label="Level"
            valueLabelDisplay="auto"
            onChange={(x) => setLevel(x.target.value)}
          />
        </Grid>
        <Grid xs={3}>
          <Box sx={{ p: 0.5, ml: 1 }}>Level: {level}</Box>
        </Grid>
      </Grid>
      <Grid container>
        <Grid xs={9} item>
          <Slider
            min={1}
            max={100}
            disabled={started}
            value={total}
            aria-label="Number of words to play"
            valueLabelDisplay="auto"
            onChange={(x) => setTotal(x.target.value)}
          />
        </Grid>
        <Grid xs={3}>
          <Box sx={{ p: 0.5, ml: 1 }}>Count: {total}</Box>
        </Grid>
      </Grid>
      <Grid container>
        <Grid xs={9} item>
          <Slider
            min={10}
            max={30}
            disabled={started}
            value={delay}
            aria-label="Delay"
            valueLabelDisplay="auto"
            onChange={(x) => setDelay(x.target.value)}
          />
        </Grid>
        <Grid xs={3}>
          <Box sx={{ p: 0.5, ml: 1 }}>Delay: {delay} s</Box>
        </Grid>
      </Grid>
      <Stack spacing={2} direction="row">
        <Button
          onClick={() => setStarted(true)}
          variant="contained"
          disabled={started}
        >
          STARTs
        </Button>
        <Button variant="outlined">Outlined</Button>
      </Stack>
      <Typography
        variant="h2"
        mt={2}
        sx={{
          fontSize: "7em",
          color: "transparent",
          textShadow: "0 0 25px #000",
        }}
      >
        {word?.word || ""}
      </Typography>

      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        {[word, ...playedWords.reverse()].filter(Boolean).map((w) => (
          <ListItem key={w.word}>
            <ListItemIcon>
              <CampaignIcon />
            </ListItemIcon>
            <ListItemText id="switch-list-label-wifi" primary={w.word} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default App;
