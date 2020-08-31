export default (total = 6) => {
  let randomNumber = '';
  for (let index = 0; index < total; index += 1) {
    randomNumber += Math.floor(Math.random() * (9 - 0) + 0).toString();
  }

  return randomNumber;
};
