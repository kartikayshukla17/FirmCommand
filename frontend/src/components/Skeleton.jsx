import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`fc-skeleton ${className}`}
            {...props}
        />
    );
};

export default Skeleton;
