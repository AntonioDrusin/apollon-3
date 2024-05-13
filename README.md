# Apollon setup

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run deploy`
Deploys the app online onto the github page that was configured

## Developing for Apollon

### Adding a visualizer
Create a new folder in the visualizers folder. Inputs to the visualizer 
will have the "Input" attributes.

constructor: called once the first time your visualizer is selected
load: called once after the constructor. Can run async functions to load any resources you may need.
pause: called to pause the visualizer, either for just pausing the visualization or for switching to a new visualizer.
start: called to start the visualizer. Called after load and after pause, to restart the visualization.

### Adding to the code
You are free to fork and change this project as much as you want. 
If there is interest we may help maintain this project, but at this point it's pretty much all there will be.

---

__Sponsored by:__

[Associazione RiMeMuTe](https://rimemute.it/)

_Premiered in_:

[MezzoCielo 3.0 - an experiment in live music, visual arts and neuroscience](https://rimemute.it/produzione/mezzocielo-3-0/)

---

__Credits:__

[TheDruid](https://github.com/AntonioDrusin) - _main coding, design, maintenance_

[AlePax](https://github.com/AlePax) - _design, project management, testing_

---


