const randomHexGenerate = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 16).toString(16);
  }
  return result;
};

export default randomHexGenerate;
