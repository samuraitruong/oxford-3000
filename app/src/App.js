import "./App.css";
import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CampaignIcon from "@mui/icons-material/Campaign";

import { Container, Slider, Grid, Typography, Box } from "@mui/material";

function App() {
  const [level, setLevel] = useState(7);

  const [started, setStarted] = useState(false);
  const [total, setTotal] = useState(60);
  const [delay, setDelay] = useState(10);
  const [word, setWord] = useState();
  const [data, setData] = useState(undefined);
  const [playedWords, setPlayedWord] = useState([]);

  const playSound = (sound) => {
    new Audio(
      `https://raw.githubusercontent.com/samuraitruong/oxford-3000/master/data/media/${sound}`
    ).play();
  };

  useEffect(() => {
    if (!data) {
      fetch(
        "https://raw.githubusercontent.com/samuraitruong/oxford-3000/master/data/oxford-5000.json"
      )
        .then((x) => x.json())
        .then((t) => {
          const wordsFilters = t.filter(
            (x) => x.word.length <= level && x.word.length > level - 3
          );
          setData(wordsFilters);
        });
    }
    if (started) {
      const playWord = () => {
        const index = Math.floor(Math.random() * data.length);
        const newWord = data[index];
        const sounds = [...newWord.sound.uk, ...newWord.sound.us].map((x) =>
          x.split("/").pop()
        );
        setWord(newWord);
        setTimeout(() => {
          const list = [newWord, ...playedWords];
          if (list.length > total) {
            setStarted(false);
          }

          setPlayedWord(list);
        }, delay * 1000 + 1000);

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
    <Container maxWidth="sm" sx={{ mt: 5 }}>
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
            marks
            step={5}
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
            min={5}
            marks
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
      <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
        <Button
          onClick={() => setStarted(true)}
          variant="contained"
          disabled={started}
        >
          STARTs
        </Button>
        <Button variant="outlined">Reset</Button>
      </Stack>

      <Box
        sx={{
          width: "100%",
          maxWidth: 360,
          bgcolor: "background.paper",
          flexDirection: "column",
        }}
      >
        {[word, ...playedWords].filter(Boolean).map((w, i) => (
          <Grid
            key={i}
            container
            direction="row"
            alignItems="center"
            xs={{ mt: 2 }}
          >
            <Grid item>
              <Typography
                variant="h3"
                sx={{
                  fontSize: "1em",
                  color: i > 0 ? "#444" : "transparent",
                  textShadow: i === 0 ? "0 0 35px #000" : undefined,
                }}
              >
                {playedWords.length - i + 1 + ". " + w.word}
              </Typography>
            </Grid>
            <Grid item sx={{ pl: 2 }}>
              <CampaignIcon />
            </Grid>
          </Grid>
        ))}
      </Box>
    </Container>
  );
}

export default App;
