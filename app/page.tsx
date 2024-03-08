import Image from "next/image"

const Home = () => {
  return (
    <>
      <section className="px-6 md:px-20 py-24 border-2 border-red-500">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Smart Shopping starts here:
              <Image
                src='/assets/icons/arrow-right.svg'
                width={16}
                height={16}
                alt="arrow-right"
              />
            </p>

            <h1 className="head-text">

            </h1>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home