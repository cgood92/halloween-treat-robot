For more information, see this Medium article: https://clintgoodman27.medium.com/how-to-build-a-trick-or-treat-bot-df2069c95e9d?source=friends_link&sk=1de0b876bb65daf885fcd5f720246b8f

# To run locally

On the laptop:

1. Download Ollama: https://ollama.com/
2. [Generate a local ssl certificate](https://www.freecodecamp.org/news/how-to-set-up-https-locally-with-create-react-app/)
3. Run `cd client && yarn && yarn build && cd ..`
4. Run `cd server && yarn && yarn start`
5. (new tab) Run `ollama pull llama3.1 && ollama serve`

Then load the following webpages in a browser of the different devices (below we're using 0.0.0.0, but use your network ip address instead):

1. Laptop: https://0.0.0.0:8080/voice
2. Tablet: https://0.0.0.0:8080/head
3. Phone: https://0.0.0.0:8080/dialogue

Connect Arduino to laptop using USB.

# Contribute

Pull requests welcome.
