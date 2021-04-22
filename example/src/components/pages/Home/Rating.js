import StarRatings from "react-star-ratings";
import React from "react";
import { Button } from "../../Button";
import UserStore from "../Login/Stores/UserStore";

class Rating extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rating: 0,
        };
    }

    changeRating = (newRating) => {
        this.setState({ rating: newRating });
    }

    //Call to push data to database
    async submitRating() {
        try {
            let res = await fetch('/updateRating', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    username: UserStore.username,
                    routeID: this.props.routeID,
                    rating: this.state.rating,
                })
            });
            let result = await res.json();
                if (result && result.success) {
                    // If successful there should be nothing to do    ****   Not sure about this   ****
                } else {
                    alert("Could not insert information into database or user is not logged in!");
                }
        } catch(e) {
            console.log(e)
        }
    }
 
    render() {
        return(
        <div>
            <div>
                <StarRatings
                    rating={this.state.rating}
                    starRatedColor="#1c2237"
                    starHoverColor="#fff400"
                    changeRating={this.changeRating}
                    numberOfStars={5}
                    name='rating'
                />
            </div>
            <div style={{ textAlign: "center", paddingTop: "15px" }}>
                <Button buttonStyle='btn--nospaces' onClick={() => this.submitRating()}>Submit Rating</Button>
            </div>
        </div>
        )
    }
}

export default Rating