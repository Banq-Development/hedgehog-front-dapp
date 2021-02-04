import React from "react";

// reactstrap components
import { Container, Nav, NavItem, NavLink,} from "reactstrap";

class AppFooter extends React.Component {
  render() {
    var url = "https://github.com/Banq-Development";
    return (
      <footer>
        <Container fluid>
          <Nav>
            <NavItem>
              <NavLink
                className="text-light text-right"
                href={url}
                target="_blank"
              >
                Github
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className="text-light text-right"
                href={""}
                target="_blank"
              >
                Docs
              </NavLink>
            </NavItem>
          </Nav>
        </Container>
      </footer>
    );
  }
}

export default AppFooter;
