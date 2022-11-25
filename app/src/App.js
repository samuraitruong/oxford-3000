import "./App.css";
import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Container, Slider, Typography, Grid, Box } from "@mui/material";

function App() {
  const [level, setLevel] = useState(6);
  const [interval, setIntervalId] = useState(undefined);

  const [started, setStarted] = useState(false);
  const [total, setTotal] = useState(20);
  const [delay, setDelay] = useState(15);
  const [word, setWord] = useState();
  const [data, setData] = useState(undefined);
  const [playedWords, setPlayedWord] = useState([]);

  useEffect(() => {
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
  }, [data, level]);

  const startInterval = (d) => {
    setStarted(true);
    const playSound = (sound) => {
      new Audio(
        `https://raw.githubusercontent.com/samuraitruong/oxford-3000/master/data/media/${sound}`
      ).play();
    };

    const playWord = () => {
      const index = Math.floor(Math.random() * d.length);
      const newWord = d[index];
      const sounds = [...newWord.sound.uk, ...newWord.sound.us].map((x) =>
        x.split("/").pop()
      );
      console.log("[...playedWords, newWord]", [...playedWords, newWord]);
      setPlayedWord([...playedWords, newWord]);
      setWord(newWord);
      for (let i = 0; i < sounds.length; i++) {
        setTimeout(
          () => playSound(sounds[i]),
          (delay / sounds.length) * i * 1000
        );
      }
      console.log(playedWords, total);
      if (playedWords.length > total) {
        // Stop interval
        clearInterval(interval);
        setStarted(false);
      }
    };
    playWord();
    setIntervalId(setInterval(playWord, delay * 1000));
  };

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
          onClick={() => startInterval(data)}
          variant="contained"
          disabled={started}
        >
          STARTs
        </Button>
        <Button variant="outlined">Outlined</Button>
      </Stack>
      <Typography variant="h2" mt={2}>
        {word?.word || ""}
      </Typography>
    </Container>
  );
}

export default App;
