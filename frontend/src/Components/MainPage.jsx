import Upload from "./Upload"
import View from "./View"

const MainPage = () => {
  return (
    <>
    <div className="flex w-full">
        <div className="card grid h-screen flex-grow place-items-center w-1/5"><Upload/></div>
        <div className="divider divider-horizontal"></div>
        <div className="card grid h-screen flex-grow place-items-center w-4/5"><View/></div>
    </div>
    </>
  )
}

export default MainPage