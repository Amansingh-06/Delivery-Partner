import React from 'react'

function Loader() {
    return (
        <>
            <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex justify-center items-center">
                <span className="loader"></span>

            </div>
        </>
    )
}

export default Loader