import React from 'react'

const MainCard = ({ title, children }) => {
    return (
        <div className='main-card'>
            <div className="main-card-title">
                <h1>{title}</h1>
            </div>
            {children}
        </div>
    )
}

export default MainCard
