import "./App.css";
import { useState, useRef, useCallback } from "react";
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
    } else if (value == 0) {
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
          {history.map(({key, value}) => {
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
          <>
            <Box
              p="10"
              maxW="520px"
              maxH="420px"
              borderWidth="1px"
              background="white"
              borderRadius="4px"
            >
              <Flex align="baseline" flexDirection="column">
                <Badge colorScheme="purple" fontSize="lg">
                  RESULTS:
                </Badge>
                <Text
                  ml={2}
                  textTransform="uppercase"
                  fontSize="lg"
                  fontWeight="bold"
                  color="purple.700"
                >
                  {resultsDrunk > 0.5
                    ? "YOU ARE DRUNK!!!"
                    : "YOU ARE NOT DRUNK"}
                </Text>
                <Text pt="34px">
                  Your drunk score:
                  {resultsDrunk}
                </Text>
                <Text pt="24px">Age: {results.age.value}</Text>
                <Text pt="24px">
                  Female Beauty Score: {results.beauty.female_score}
                </Text>
                <Text pt="24px">
                  Male Beauty Score: {results.beauty.male_score}
                </Text>
                <Text pt="24px">Gender: {results.gender.value}</Text>
                <Text pt="24px">Sadness: {results.emotion.sadness}</Text>
                <Text pt="24px">Disgust: {results.emotion.disgust}</Text>
                <Text pt="24px">Anger: {results.emotion.anger}</Text>
                <Text pt="24px">Surprise: {results.emotion.surprise}</Text>
                <Text pt="24px">Fear: {results.emotion.fear}</Text>
                <Text pt="24px">Happiness: {results.emotion.happiness}</Text>
                <Button
                  mt="24px"
                  onClick={() => {
                    setResponse(null);
                  }}
                >
                  Reset
                </Button>
              </Flex>
            </Box>
          </>
        ) : (
          <>
            <Box
              p="10"
              maxW="520px"
              borderWidth="1px"
              background="white"
              borderRadius="4px"
            >
              <Flex align="baseline" mt={2}>
                <Badge colorScheme="purple">ATTENTION</Badge>
                <Text
                  ml={2}
                  textTransform="uppercase"
                  fontSize="sm"
                  fontWeight="bold"
                  color="purple.700"
                >
                  BeSober
                </Text>
              </Flex>
              <FormControl>
                <FormLabel>
                  Add your drunk/sober photo here to find out NOW!!!
                </FormLabel>
                {/* <Input
                  borderWidth="0px"
                  type="file"
                  onChange={(e) => {
                    console.log(e);
                    console.log(e.target.files[0]);
                    setInput(e.target.files[0]);

                    setImg(URL.createObjectURL(e.target.files[0]));
                  }}
                /> */}

                {img ? 
                <Image src={img} alt="drunk" height={240} width={320} /> :  
                <Webcam
                  height={240}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={320}
                />
}
                <Button onClick={() => {
                  capture()
                }}>Capture photo</Button>
                <FormHelperText>
                  {myVar}
                </FormHelperText>

              </FormControl>


              {renderHistory()}

              {/* <Button
                mt="24px"
                onClick={() => {
                  submitFormWithInput();
                }}
              >
                Submit
              </Button> */}
            </Box>
          </>
        )}
      </Center>
    </ChakraProvider>
  );
}

export default App;
