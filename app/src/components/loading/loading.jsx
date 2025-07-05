import "./loading.css"; // Vamos criar este arquivo CSS separado

function Loading() {
  return (
    <>
      <section className="bg-[url('https://i.pinimg.com/736x/09/8e/15/098e15db6e93a2fe19d7ddcc5ee9beee.jpg')] bg-cover bg-center bg-no-repeat h-screen w-screen fixed top-0 left-0  z-[9999]">
        <div className="bg-black/50 backdrop-blur-xl  flex flex-col gap-6 items-center justify-center h-full">
          <div className="birdLoader">
            <span className="birdLoader__blue1"></span>
            <span className="birdLoader__white"></span>
            <span className="birdLoader__grey"></span>
            <span className="birdLoader__yellow"></span>
            <span className="birdLoader__orange"></span>
            <span className="birdLoader__blue"></span>
          </div>
          <div>
            <h1 className="text-white font-extrabold text-7xl">
              S<span className="text-[#00a8c6]">UP</span>I
            </h1>
          </div>
        </div>
      </section>
    </>
  );
}

export default Loading;
