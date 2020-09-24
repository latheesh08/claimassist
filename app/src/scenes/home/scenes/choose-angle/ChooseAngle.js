import React, { Component } from "react";
import {
    Title,
    TopNav,
    ArrowButton,
    TermsandPrivacy
} from "../../../../components";
import { Grid, Input, GridList, GridListTile, GridListTileBar, ListSubheader, IconButton } from "@material-ui/core";
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Redirect, Link } from "react-router-dom";
import { withSnackbar } from "notistack";
import { withStyles } from "@material-ui/core/styles";
import {
    selectedPoses, chosenAngles
} from "../../../../actions";
import TipModal from "../photo-tips/components/TipModal";


const styles = theme => ({
    car_card: {
        // border : '1px solid red'
        height: 'auto !important',

    },
    image_wrap: {
        width: '98%',
        height: '80% ',
        borderRadius: '10px'
    },
    car_angle_images: {
        height: 'auto', width: '98%'
    },
    car_title: {
        height: ' 0 !important', background: '#fff', color: 'black !important'
    },
    gridList: {
        // width: '100%',
        // height: 'auto',
        maxWidth: "800px",
        margin: '0 !important'
    },
});



class Angles extends Component {
    state = {
        navigateTo: null, border: 'none',
        selected_poses: [],
        data: null,
        showTips: false,


    }

    componentWillMount() {
        this.setState({
            data: this.props.details
        })
    }
    componentDidMount() {
        if (
            this.props.location.state &&
            this.props.location.state.showTips &&
            this.props.location.state.showTips === true
        ) {
            this.setState({ showTips: true });
        }
        //   if(this.props.userInfo.isUnderwriting){
        //     // if(true){
        //   this.props.selectedPoses(this.props.details)
        //   this.setState({navigateTo : "/individual-angle"})
        //     }
    }

    render() {
        if (this.state.navigateTo) {
            return <Redirect push to={this.state.navigateTo} />;
        }
        const { t, classes } = this.props;
        return (
            <div className="chooseAngleContainer">
                <TopNav backType="backward" hasMore goBack={() => this.props.history.goBack()} />
                <div className="content">
                    <Title
                        title={t("home.choose_angle.title")}
                    />
                    <GridList className={classes.gridList} cols={2}>
                        {
                            this.state.data.map((item, idx) => (
                                <GridListTile className={classes.car_card}
                                    onClick={() => {
                                        var data = this.props.details
                                        if ('select' in item && item.select == true) {
                                            data[idx].select = false
                                            this.setState({
                                                data: data
                                            })
                                            // this.props.chosenAngles(data);
                                        } else {
                                            data[idx].select = true
                                            this.setState({
                                                data: data
                                            })
                                            // this.props.chosenAngles(data);
                                        }
                                    }}
                                    key={idx}
                                >
                                    <div className={classes.image_wrap} style={{ backgroundColor: '#ebebeb', border: 'select' in item ? item.select == true ? '2px solid red' : 'none' : 'none' }}>
                                        <img src={item.image} alt={t("general.not-found")} className={classes.car_angle_images} />
                                    </div>
                                    <div style={{ color: 'black' }} style={{ color: 'select' in item ? item.select == true ? 'red' : 'black' : 'black' }}>{t(`home.common-pose.${item.storage_name}`)}</div>
                                </GridListTile>
                            ))
                        }

                    </GridList>
                    <ArrowButton
                        onClick={() => {
                            console.log(this.state.data)
                            this.props.chosenAngles(this.state.data)
                            var selected_data = this.state.data.filter(item => ('select' in item && item.select == true))
                            if (selected_data.length > 0) {
                                // this.setState({
                                //     data : this.props.details
                                // })

                                this.props.selectedPoses(selected_data)
                                this.setState({ navigateTo: "/individual-angle" })

                                console.log(this.state.data)
                            } else {
                                this.props.enqueueSnackbar(
                                    this.props.t("general.empty-pose"),
                                    {
                                        variant: "warning",
                                        autoHideDuration: 3000
                                    }
                                );
                            }
                            console.log(selected_data);
                        }}

                        icon="arrow_forward"
                        disabled={
                            false
                        }
                    />
                    <TipModal
                        open={this.state.showTips}
                        cancel={() => this.setState({ showTips: false })}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        userInfo: state.userReducer.userInfo,
        details: state.chooseAngleReducer.selected_poses
    };
};

const mapDispatchToProps = dispatch => {
    return {
        selectedPoses: poses => dispatch(selectedPoses(poses)),
        chosenAngles: data => dispatch(chosenAngles(data))
    }
}

export default withNamespaces('common')(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withStyles(styles)(withSnackbar(Angles)))
)
