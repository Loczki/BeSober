import "./App.css";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button, ChakraProvider } from "@chakra-ui/react";
import {
  Center,
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Text,
  Badge,
  Flex,
  Image,
} from "@chakra-ui/react";
import Webcam from "react-webcam";
//moment
import moment from "moment";

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]), 
      n = bstr.length, 
      u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}


function App() {
  const [input, setInput] = useState();
  const [img, setImg] = useState();
  const [response, setResponse] = useState();
  const webcamRef = useRef(null);
  const [results, setResults] = useState();
  const [resultsDrunk, setResultsDrunk] = useState();
  const [responseDrunk, setResponseDrunk] = useState();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    
    setImg(imageSrc);
    submitForm(dataURLtoFile(imageSrc, 'image.jpg'));
  }, [webcamRef]);


  const getDrunkTextFormat = (value) => {
    if (value == 1) {
      return "Drunk with 100% certainty"
    } else if (value === 0) {
      return "Sober with 100% certainty"
    } else {
      return "Most likely sober"
    }
  }


  const renderHistory = () => {
    if (typeof(Storage) !== "undefined") {
      var itemCount = localStorage.length;
      var history = [];
      for (var i = 0; i < itemCount; i++) {
          var key = localStorage.key(i);
          if(key.startsWith("chakra")) continue;
          var value = localStorage.getItem(key);
          history.push({key, value});
      }


      return (
        <Box>
          <Text pt="24px">History: </Text>
          {history.sort((a,b) => b.key - a.key).slice(0, 5).map(({key, value}) => {
            return (
              <Text pt="24px">{moment(parseInt(key)).fromNow()} {getDrunkTextFormat(value)}</Text>
            )
          })}
        </Box>
      )
    } else {
      console.log("localStorage spadl z rowerka");
    }
  }

  const [myVar, setMyVar] = useState('');

  useEffect(() => {
    // Ustawienie opóźnienia na 1 minutę (60 000 milisekund)
    const delay = 60000;

    // Ustawienie timera, który wyświetli powiadomienie po upływie opóźnienia
    const notificationTimer = setTimeout(() => {
      showNotification();
    }, delay);

    // Wyczyszczenie timera, jeśli komponent zostanie odmontowany przed upływem minuty
    return () => clearTimeout(notificationTimer);
  }, []);

  const showNotification = () => {
    // Sprawdź, czy przeglądarka obsługuje powiadomienia
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          // Wyświetl powiadomienie
          new Notification('Masz 5 minut na wysłanie zdjęcia', {
            body: 'Wyślij powiadomienie BeSober',
            icon: './../public/logo.jpg', // Opcjonalna ścieżka do ikony
          });
        }
      });
    }
  }

  const submitForm = async (file) => {
    const formData = new FormData();
    console.log("FILE", file)
    formData.append("file", file);

    try {
      console.log(
        "api endpoint:",
        `${process.env.REACT_APP_DRUNK_API_URL}/api/submit/`
      );
      const response = await fetch(
        `${process.env.REACT_APP_DRUNK_API_URL}api/submit/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response) {
        console.log(response);
        const data = await response.json();
        const parsed = JSON.parse(data.success);
        console.log("Wynik aktualny:")
        console.log(parsed);

        if (typeof(Storage) !== "undefined") {
          // dodawanie
          new Date().getTime();
          localStorage.setItem(new Date().getTime(), parsed)

          // wypisywanie calego
          // console.log("Caly localStorage:")
          // var itemCount = localStorage.length;
          // for (var i = 0; i < itemCount; i++) {
          //     var key = localStorage.key(i);
          //     var value = localStorage.getItem(key);
          //     console.log("Klucz: " + key + ", Wartość: " + value);
          // }
          setMyVar(getDrunkTextFormat(parsed));

        } else {
          console.log("localStorage spadl z rowerka");
        }

        setImg(null);
      }
    } catch (error) {
      console.log("error!!!");
      setMyVar("No face detected");
      console.log(error);
      setImg(null)
    }
  };

  return (

    <ChakraProvider>
      <Center h="100vh">
        {response && results ? (
          <Box
            p="10"
            maxW="520px"
            maxH="420px"
            borderWidth="1px"
            borderradius="4px"
            textAlign="center"
            bgGradient="linear(to-b, #4F3BA9, #CB429F)"
            boxShadow="lg"
            color="white"
          >
            <Flex align="center" flexDirection="column">
              <Badge colorScheme="purple" fontSize="lg">
                RESULTS:
              </Badge>
              <Text
                mt="2"
                textTransform="uppercase"
                fontSize="lg"
                fontWeight="bold"
              >
                {resultsDrunk > 0.5 ? "YOU ARE DRUNK!!!" : "YOU ARE NOT DRUNK"}
              </Text>
              <Text pt="4" fontSize="md">
                Your drunk score:
                {resultsDrunk}
              </Text>
              <Text pt="4">Age: {results.age.value}</Text>
              <Text pt="4">
                Female Beauty Score: {results.beauty.female_score}
              </Text>
              <Text pt="4">Male Beauty Score: {results.beauty.male_score}</Text>
              <Text pt="4">Gender: {results.gender.value}</Text>
              <Text pt="4">Sadness: {results.emotion.sadness}</Text>
              <Text pt="4">Disgust: {results.emotion.disgust}</Text>
              <Text pt="4">Anger: {results.emotion.anger}</Text>
              <Text pt="4">Surprise: {results.emotion.surprise}</Text>
              <Text pt="4">Fear: {results.emotion.fear}</Text>
              <Text pt="4">Happiness: {results.emotion.happiness}</Text>
              <Button
                mt="4"
                onClick={() => {
                  setResponse(null);
                }}
              >
                Reset
              </Button>
            </Flex>
          </Box>
        ) : (
          <Box
            p="10"
            maxW="520px"
            borderWidth="1px"
            borderradius="4px"
            textAlign="center"
            bgGradient="linear(to-b, #4F3BA9, #CB429F)"
            boxShadow="lg"
            color="white"
          >
            <Flex align="center" flexDirection="column">
              <Badge colorScheme="purple">ATTENTION</Badge>
              <Text
                mt="2"
                textTransform="uppercase"
                fontSize="md"
                fontWeight="bold"
              >
                BeSober
              </Text>
            </Flex>
            <FormControl mt="4">
              <FormLabel>
                Take picture of your face to check if you are drunk
              </FormLabel>
              {img ? (
                <Image
                  src={img}
                  alt="drunk"
                  height={310}
                  width={520}
                  borderradius="4px"
                />
              ) : (
                <Webcam  
                height={240}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={520}
                borderradius="4px"
                mx="auto" // Dodane mx="auto" dla centrowania kamery
                display="block" // Dodane display="block" dla poprawnego centrowania
                />
              )}
              <Button mt="4" onClick={capture}>
                Capture photo
              </Button>
              <FormHelperText mt="2" fontSize="lg">
                {myVar}
              </FormHelperText>
            </FormControl>
            {renderHistory()}
          </Box>
        )}
      </Center>
    </ChakraProvider>
  );
}

export default App;
