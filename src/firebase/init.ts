import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCUX6oYXngvqjDR29JBam1LPa2FoaZmRA8',
  authDomain: 'rummy-500.firebaseapp.com',
  databaseURL: 'https://rummy-500.firebaseio.com',
  projectId: 'rummy-500',
  storageBucket: 'rummy-500.appspot.com',
  messagingSenderId: '119518676647',
  appId: '1:119518676647:web:df558bbe6e60b07dafbd82',
  measurementId: 'G-27YTQDMRCM',
};

firebase.initializeApp(firebaseConfig);

export default firebase;

export const db = firebase.firestore();
